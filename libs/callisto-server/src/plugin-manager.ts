import { ask, Callisto, CallistoContext } from '@bitmetro/callisto';
import * as path from 'path';
import * as fs from 'fs';
import { parse as parseYaml } from 'yaml';
import { execSync, fork, ChildProcess } from 'child_process';
import * as chalk from 'chalk';
import { Express } from 'express';
import * as ws from 'ws';

import { sendAnswer, sendCommand } from './ipc';
import { Instance, PluginImport, PluginImportSchema, PluginInteraction, PluginProcesses } from './models';
import { Logger } from './logger';
import { Downloader, DownloadRejectionReason } from './downloader';
import { ManifestManager } from './manifest';
import { extractName } from './utils';

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
    app.get('/download', async (req, res) => {
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
  }

  private async downloadPlugin(url: string) {
    const { name, version, pluginFile, source } = await this.downloader.downloadPlugin(url as string, this.pluginsDir);
    const plugin = this.importPlugin(pluginFile);

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

  importPlugins() {
    const manifest = this.manifestManager.readManifest();

    Object.keys(manifest)
      .forEach(pluginId => this.importPlugin(path.resolve(this.pluginsDir, manifest[pluginId].pluginFile)))
  }

  applyPlugins(callisto: Callisto) {
    return this.plugins
      .reduce<PluginProcesses>((acc, plugin) => ({
        ...acc,
        [plugin.name]: this.applyPlugin(callisto, plugin)
      }), {})
  }

  private importPlugin(pluginFile: string) {
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
      execSync('npm i', { cwd: pluginPath, stdio: 'inherit' });

      if (fs.existsSync(path.resolve(pluginPath, config.resolve))) {
        this.logger.log('Already built. Skipping...', fullName)
      } else {
        this.logger.log('Building', fullName);
        execSync('npm run build', { cwd: pluginPath, stdio: 'inherit' });
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
