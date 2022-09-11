import { ask, CallistoContext } from '@bitmetro/callisto-core';
import * as path from 'path';
import * as fsp from 'fs/promises';
import * as fs from 'fs';
import { parse as parseYaml } from 'yaml';
import { fork, ChildProcess } from 'child_process';
import * as chalk from 'chalk';
import * as rimraf from 'rimraf';

import { sendAnswer, sendCommand } from './ipc';
import { PluginImport, PluginInteraction, UninstallRejectionReason, PluginRef, Instance } from './models';
import { Logger } from './logger';
import { Downloader } from './downloader';
import { ManifestManager } from './manifest';
import { execAsync, extractName } from './utils';
import { Container } from './container';
import { InstanceManager } from './instance-manager';
import { PluginImportSchema } from './schemas';

export class PluginManager {
  private pluginsDir: string = __dirname;
  private plugins: PluginRef[] = [];

  private logger = Container.resolve(Logger);
  private downloader = Container.resolve(Downloader);
  private instanceManager = Container.resolve(InstanceManager);
  private manifestManager = Container.resolve(ManifestManager);

  setPluginsDir(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  async importPlugins() {
    await Promise.all(
      (await this.manifestManager.getInstalledPlugins())
        .map(({ pluginFile }) => this.importPlugin(path.resolve(this.pluginsDir, pluginFile)))
    )

    this.instanceManager
      .forEach(handle => {
        this.applyAllPluginsToInstance(handle);
        this.sendPrompts(handle);
      });
  }

  sendPrompts(handle: string) {
    const instance = this.instanceManager.get(handle);
    instance.ws.sendPrompts(instance.callisto.getContextChain().map(ctx => ctx.getPrompts()).flat());
  }

  applyAllPluginsToInstance(handle: string) {
    const instance = this.instanceManager.get(handle);
    if (!instance) {
      return;
    }

    const processes: ChildProcess[] = [];

    for (let plugin of this.plugins) {
      if (!instance.processes[plugin.name]) {
        const process = this.applyPluginToInstance(instance, plugin);
        processes.push(process!);
      }
    }

    this.logger.log(`Created processes ${Object.values(processes).map(p => chalk.gray(p?.pid)).join(', ')}`, handle);
  }

  async prunePlugins() {
    this.logger.log('Pruning stale plugins...');

    const pluginFoldersInManifest = (await this.manifestManager.getInstalledPlugins()).map(({ name, version }) => `${name}-${version}`);

    const pluginFolders = await fsp.readdir(this.pluginsDir);

    const excessPlugins = pluginFolders
      .filter(file => file !== 'manifest.json')
      .filter(folder => !pluginFoldersInManifest.find(m => m === folder));

    this.logger.log(`Removing ${excessPlugins.map(folder => chalk.gray(folder)).join(', ')}`)

    excessPlugins.forEach(pluginFolder => rimraf.sync(path.resolve(this.pluginsDir, pluginFolder)))

    const killedProcessIds = this.instanceManager.killProcesses(excessPlugins.map(plugin => extractName(plugin)));

    if (killedProcessIds.length) {
      this.logger.log(`Killed processes ${chalk.gray(killedProcessIds.join(', '))}`);
    }

    this.logger.log('System pruned');
  }

  async uninstallPlugin(name: string) {
    this.logger.log(`Uninstalling plugin ${name}...`)
    const manifest = await this.manifestManager.readManifest();

    const manifestPlugin = manifest[name];

    if (!manifestPlugin) {
      throw 'no-plugin' as UninstallRejectionReason;
    }

    await this.manifestManager.removeFromManifest(name);
    await this.prunePlugins();
  }

  async downloadPlugin(url: string) {
    const { name, version, pluginFile, source } = await this.downloader.downloadPlugin(url as string, this.pluginsDir);
    const plugin = await this.importPlugin(pluginFile);

    await this.manifestManager.updateManifest({
      [name]: { name, version, pluginFile: path.relative(this.pluginsDir, pluginFile), source }
    })

    this.instanceManager
      .forEach((handle, instance) => {
        const foundProcess = instance.processes[name];

        if (!!foundProcess) {
          this.logger.log(`Killing process ${chalk.gray(foundProcess.pid)}`, handle);
          this.instanceManager.killProcess(handle, name);
        }

        const process = this.applyPluginToInstance(instance, plugin);
        if (process) {
          this.logger.log(`Created processes ${chalk.gray(process.pid)}`, handle);
        }

        this.sendPrompts(handle);
      })
  }

  private async importPlugin(pluginFile: string) {
    const pluginPath = path.dirname(pluginFile);
    const pluginFileContent = await fsp.readFile(pluginFile, 'utf-8');
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

      try {
        await fsp.access(path.resolve(pluginPath, config.resolve), fs.constants.F_OK);
        this.logger.log('Already built. Skipping...', fullName)
      } catch {
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

  private applyPluginToInstance(instance: Instance, plugin?: PluginRef) {
    if (plugin) {
      const { name, resolve, pluginPath, interactions } = plugin;
      const process = fork(resolve, { cwd: pluginPath });
      instance.processes[plugin.name] = process;

      instance.callisto.getRootContext().removeInteractions(name);

      this.addPluginInteractions(name, process!, instance.callisto.getRootContext(), interactions, pluginPath);

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
