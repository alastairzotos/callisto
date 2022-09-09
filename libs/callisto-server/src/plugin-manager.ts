import { ask, Callisto, CallistoContext, CallistoResponse } from '@bitmetro/callisto';
import * as path from 'path';
import * as fs from 'fs';
import { parse as parseYaml } from 'yaml';
import { exec, fork, ChildProcess } from 'child_process';
import * as chalk from 'chalk';
import { Express } from 'express';
import * as ws from 'ws';
import * as rimraf from 'rimraf';

import { sendAnswer, sendCommand } from './ipc';
import { Instance, PluginImport, PluginImportSchema, PluginInteraction, DownloadRejectionReason, UninstallRejectionReason } from './models';
import { Logger } from './logger';
import { Downloader } from './downloader';
import { ManifestManager } from './manifest';
import { extractName } from './utils';

const execAsync = (cmd: string, cwd: string) => new Promise<void>((resolve, reject) => {
  exec(cmd, { cwd }, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return reject(err);
    }

    console.log(stdout);
    resolve();
  })
})

export interface PluginRef {
  name: string;
  fullName: string;
  resolve: string;
  pluginPath: string;
  interactions: PluginInteraction[];
}

export class PluginManager {
  ws: ws.WebSocket | undefined;

  private pluginsDir: string = __dirname;
  private plugins: PluginRef[] = [];
  private downloader: Downloader;
  private manifestManager = new ManifestManager();

  constructor(
    private logger: Logger,
    private callistoInstances: { [key: string]: Instance }
  ) {
    this.downloader = new Downloader(logger);
  }

  setPluginsDir(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
    this.manifestManager.setPluginsDir(pluginsDir);
  }

  setupEndpoints(app: Express) {
    app.get('/plugins', (_, res) => {
      res.json(this.manifestManager.readManifest());
    });

    app.get('/prune', async (_, res) => {
      await this.prunePlugins();

      res.send('System pruned');
    })

    app.get('/plugin/install', async (req, res) => {
      try {
        await this.downloadPlugin(req.query.url as string);

        res.send('Downloaded ' + req.query.url);
      } catch (e) {
        const reason = e as DownloadRejectionReason;
        if (reason === 'not-found') {
          res.status(404).send(`Cannot file file "${req.query.url}"`);
        } else if (reason === 'bad-format') {
          res.status(400).send(`Invalid filename format. Must be "[name]-[major].[minor].[patch].zip"`)
        } else {
          res.sendStatus(500);
        }
      }
    })

    app.get('/plugin/uninstall', async (req, res) => {
      try {
        await this.uninstallPlugin(req.query.name as string);

        res.send('Uninstalled ' + req.query.name);
      } catch (e) {
        const reason = e as UninstallRejectionReason;

        if (reason === 'no-plugin') {
          res.status(404).send(`No plugin named ${req.query.name} is installed`)
        }
      }
    });
  }

  async importPlugins() {
    const manifest = this.manifestManager.readManifest();

    await Promise.all(
      Object.keys(manifest)
        .map(pluginId => this.importPlugin(path.resolve(this.pluginsDir, manifest[pluginId].pluginFile)))
    )

    Object.keys(this.callistoInstances)
      .forEach(handle => {
        this.applyPluginsToInstance(handle);

        this.ws?.send(JSON.stringify({
          type: 'prompts',
          error: false,
          prompts: this.callistoInstances[handle].callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
        } as CallistoResponse))
      });
  }

  applyPluginsToInstance(handle: string) {
    const instance = this.callistoInstances[handle];
    if (!instance) {
      return;
    }

    let processes: ChildProcess[] = [];

    for (let plugin of this.plugins) {
      if (!instance.processes[plugin.name]) {
        const process = this.applyPlugin(instance.callisto, plugin);;
        instance.processes[plugin.name] = process;
        processes.push(process!);
      }
    }

    this.logger.log(`Created processes ${Object.values(processes).map(p => chalk.gray(p?.pid)).join(', ')}`, handle);
  }

  private async prunePlugins() {
    this.logger.log('Pruning stale plugins...');

    const manifest = this.manifestManager.readManifest();
    const pluginFoldersInManifest = Object.values(manifest).map(({ name, version }) => `${name}-${version}`);

    const pluginFolders = fs.readdirSync(this.pluginsDir);

    const excessPlugins = pluginFolders
      .filter(file => file !== 'manifest.json')
      .filter(folder => !pluginFoldersInManifest.find(m => m === folder));

    for (let handle of Object.keys(this.callistoInstances)) {
      for (let excessPlugin of excessPlugins) {
        const pluginName = excessPlugin.split('-')[0];

        const staleProcess = this.callistoInstances[handle].processes[pluginName];

        if (staleProcess) {
          this.logger.log(`Killing process ${chalk.gray(staleProcess.pid)}`, handle);
          staleProcess.kill();
          this.callistoInstances[handle].callisto.getRootContext().removeInteractions(pluginName);
          delete this.callistoInstances[handle].processes[pluginName];
        }
      }
    }

    this.logger.log(`Removing ${pluginFolders.map(folder => chalk.gray(folder)).join(', ')}`)
    excessPlugins.forEach(pluginFolder => {
      rimraf.sync(path.resolve(this.pluginsDir, pluginFolder));
    })

    this.logger.log('System pruned');
  }

  private async uninstallPlugin(name: string) {
    this.logger.log(`Uninstalling plugin ${name}...`)
    const manifest = this.manifestManager.readManifest();

    const manifestPlugin = manifest[name];

    if (!manifestPlugin) {
      throw 'no-plugin' as UninstallRejectionReason;
    }

    this.manifestManager.removeFromManifest(name);
    await this.prunePlugins();
  }

  private async downloadPlugin(url: string) {
    const { name, version, pluginFile, source } = await this.downloader.downloadPlugin(url as string, this.pluginsDir);
    const plugin = await this.importPlugin(pluginFile);

    this.manifestManager.updateManifest({
      [name]: { name, version, pluginFile: path.relative(this.pluginsDir, pluginFile), source }
    })

    Object.keys(this.callistoInstances).forEach(handle => {
      const process = this.applyPlugin(this.callistoInstances[handle].callisto, plugin);

      if (process) {
        const foundProcess = this.callistoInstances[handle].processes[name];
        if (!!foundProcess) {
          this.logger.log(`Killing process ${chalk.gray(foundProcess.pid)}`, handle);
          foundProcess.kill();
        }

        this.callistoInstances[handle].processes[name] = process;
        this.logger.log(`Created processes ${chalk.gray(process.pid)}`, handle);
      }
    })
  }

  private async importPlugin(pluginFile: string) {
    const pluginPath = path.dirname(pluginFile);
    const pluginFileContent = fs.readFileSync(pluginFile).toString();
    const fullName = path.basename(pluginPath);
    const format = pluginFile.endsWith('.yaml') || pluginFile.endsWith('.yml') ? 'yaml' : 'json';

    this.logger.log(`Importing plugin ${chalk.yellow(fullName)}`, fullName);

    try {
      let config: PluginImport =
        format === 'yaml'
          ? parseYaml(pluginFileContent)
          : JSON.parse(pluginFileContent);

      const { resolve, interactions } = PluginImportSchema.parse(config) as PluginImport;

      this.logger.log('Installing dependencies', fullName);
      await execAsync('npm i', pluginPath);

      if (fs.existsSync(path.resolve(pluginPath, config.resolve))) {
        this.logger.log('Already built. Skipping...', fullName)
      } else {
        this.logger.log('Building', fullName);
        await execAsync('npm run build', pluginPath);
      }

      const newPlugin: PluginRef = { name: extractName(fullName), fullName, resolve, pluginPath, interactions };
      this.plugins.push(newPlugin);

      this.logger.log('Installation complete', fullName);

      return newPlugin;
    } catch (e) {
      console.error(e);
    }
  }

  private applyPlugin(callisto: Callisto, plugin?: PluginRef) {
    if (plugin) {
      const { name, resolve, pluginPath, interactions } = plugin;
      const process = fork(resolve, { cwd: pluginPath });

      callisto.getRootContext().removeInteractions(name);

      this.addPluginInteractions(name, process!, callisto.getRootContext(), interactions, pluginPath);

      return process;
    }
  }

  private addPluginInteractions(
    pluginId: string,
    process: ChildProcess,
    ctx: CallistoContext,
    interactions: PluginInteraction[],
    basePath: string,
  ) {
    interactions.forEach(({ id, prompts, inputs, children, goToParentContextOnceFinished }) => {
      ctx.addPrompts(prompts || []);
      ctx.addInteraction(pluginId, inputs, async params => {
        try {
          const result = await sendCommand(process, id, params);

          if (result.type === 'question') {
            return ask(ctx, result.response, async answer => {
              const answerResult = await sendAnswer(process, answer);
              return answerResult.response!;
            })
          }

          if (!children || children.length === 0) {
            return result.response;
          }

          const subContext = new CallistoContext(ctx);
          this.addPluginInteractions(pluginId, process, subContext, children, basePath);

          return {
            responseText: result.response,
            goToParentContextOnceFinished,
            context: subContext
          }
        } catch {
          return 'There was an error handling your request'
        }
      })
    })
  }
}
