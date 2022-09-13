import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { Container } from './container';
import { PluginManager } from './plugin-manager';
import { ManifestManager } from './manifest';

export type Environment = { [key: string]: string };

export class EnvManager {
  private pluginsDir: string = __dirname;
  private pluginManager = Container.resolve(PluginManager);
  private manifestManager = Container.resolve(ManifestManager);

  setPluginsDir(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  async modify(pluginName: string, vars: Environment) {
    const env = await this.read(pluginName);

    const newEnv: Environment = { ...env, ...vars };
    
    const pluginDir = await this.getPluginDir(pluginName);
    if (pluginDir) {
      const envFileDir = path.resolve(pluginDir, '.env');
      const envContent = Object.keys(newEnv)
        .map(key => `${key}=${newEnv[key]}`)
        .join('\n');

      await fsp.writeFile(envFileDir, envContent, 'utf-8');
      this.pluginManager.applyEnvToPlugin(pluginName, newEnv);
    }

    return newEnv;
  }

  async read(pluginName: string): Promise<Environment> {
    const pluginDir = await this.getPluginDir(pluginName);
    if (!pluginDir) {
      return {};
    }

    const envFileDir = path.resolve(pluginDir, '.env');

    try {
      await fsp.access(envFileDir, fs.constants.F_OK);

      const fileContent = await fsp.readFile(envFileDir, 'utf-8');
      return fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => !line.startsWith('#') && line.length > 0)
        .map(line => line.split('='))
        .map(([variable, value]) => ({ variable, value }))
        .reduce<Environment>((acc, { variable, value }) => ({
          ...acc,
          [variable]: value
        }), {});

    } catch {
      await fsp.writeFile(envFileDir, '', 'utf-8');
      return {};
    }
  }

  private async getPluginDir(pluginName: string) {
    const manifest = await this.manifestManager.readManifest();
    const plugin = manifest[pluginName];
    if (!plugin) {
      return undefined;
    }

    return path.resolve(this.pluginsDir, `${plugin.name}-${plugin.version}`);
  }
}
