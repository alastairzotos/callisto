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

  readManifest(): Manifest {
    if (!fs.existsSync(this.manifestFile)) {
      fs.writeFileSync(this.manifestFile, '{}');
    }

    const content = fs.readFileSync(this.manifestFile, 'utf-8');
    return JSON.parse(content);
  }

  getInstalledPlugins(): ManifestItem[] {
    return Object.values(this.readManifest())
  }

  updateManifest(update: Manifest) {
    const current = this.readManifest();

    const newManifestData = { ...current, ...update };
    fs.writeFileSync(this.manifestFile, JSON.stringify(newManifestData, null, 2));
  }

  removeFromManifest(key: string) {
    const manifest = this.readManifest();
    delete manifest[key];
    fs.writeFileSync(this.manifestFile, JSON.stringify(manifest, null, 2));
  }
}
