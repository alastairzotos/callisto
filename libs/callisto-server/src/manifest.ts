import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';

import { ManifestItem } from './models';

export type Manifest = { [nameAndVersion: string]: ManifestItem };

export class ManifestManager {
  private pluginsDir = '';
  private manifestFile = '';

  setPluginsDir(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
    this.manifestFile = path.resolve(this.pluginsDir, 'manifest.json');
  }

  async readManifest(): Promise<Manifest> {
    try {
      await fsp.access(this.manifestFile, fs.constants.F_OK)
    } catch {
      await fsp.writeFile(this.manifestFile, '{}', 'utf-8')
    }

    const content = await fsp.readFile(this.manifestFile, 'utf-8');
    return JSON.parse(content);
  }

  async getInstalledPlugins(): Promise<ManifestItem[]> {
    return Object.values(await this.readManifest())
  }

  async updateManifest(update: Manifest) {
    const current = await this.readManifest();

    const newManifestData = { ...current, ...update };
    await fsp.writeFile(this.manifestFile, JSON.stringify(newManifestData, null, 2), 'utf-8');
  }

  async removeFromManifest(key: string) {
    const manifest = await this.readManifest();
    delete manifest[key];
    await fsp.writeFile(this.manifestFile, JSON.stringify(manifest, null, 2), 'utf-8');
  }
}
