import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as extract from 'extract-zip';
import { uuid as uuidv4 } from 'uuidv4';

import { Logger } from './logger';
import { ManifestItem, DownloadRejectionReason } from './models';
import { Container } from './container';

interface NameValidation {
  name: string;
  ext: string;
  version: string;
}

export class Downloader {
  private logger = Container.resolve(Logger);

  async downloadPlugin(url: string, destDir: string): Promise<ManifestItem> {
    this.logger.log(`Downloading plugin`);
    const { uuid, zipFilePath } = await this.downloadPluginFile(url, destDir);

    this.logger.log('Download completed. Extracting...', uuid);

    const pluginDir = path.resolve(destDir, uuid!);

    await extract(zipFilePath, { dir: pluginDir });
    await fsp.rm(zipFilePath);

    this.logger.log('Extracting completed', uuid);

    const packageJson = JSON.parse(await fsp.readFile(path.resolve(pluginDir, 'package.json'), 'utf-8'));
    const name = packageJson.name as string;
    const version = packageJson.version as string;

    const newPluginDir = path.resolve(destDir, `${name}-${version}`);
    await fse.copy(pluginDir, newPluginDir);
    await fse.rm(pluginDir, { recursive: true, force: true });

    return {
      name,
      version,
      pluginFile: path.resolve(newPluginDir, 'plugin.yaml'),
      source: url
    }
  }

  private async downloadPluginFile(url: string, destDir: string) {
    return new Promise<{ uuid: string, zipFilePath: string }>((resolve, reject) => {
      const uuid = uuidv4();

      this.logger.log(`Downloading plugin with temp ID ${uuid}`, uuid);

      const zipFilePath = path.resolve(destDir, `${uuid}.zip`);
      const get = url.startsWith('http://') ? http.get : https.get;

      get(url, response => {
        if (response.statusCode === 404) {
          this.logger.log(`Cannot find plugin ${url}`, uuid);
          return reject('not-found' as DownloadRejectionReason);
        } else {
          const file = fs.createWriteStream(zipFilePath);

          file.on('finish', async () => {
            file.close();
            resolve({ uuid, zipFilePath });
          });

          file.on('error', reject);

          response.pipe(file);
        }
      });
    });
  }
}
