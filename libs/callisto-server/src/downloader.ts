import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as extract from 'extract-zip';

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

  async downloadPlugin(url: string, destDir: string) {
    return new Promise<ManifestItem>((resolve, reject) => {
      try {
        const name = this.getNameFromUrl(url)

        const nameValidation = this.validateFileName(name, path.extname(url));
        if (!nameValidation) {
          return reject('bad-format' as DownloadRejectionReason)
        }

        this.logger.log(`Downloading plugin`, name);

        const zipFilePath = path.resolve(destDir, `${name}.zip`);
        const get = url.startsWith('http://') ? http.get : https.get;

        get(url, response => {
          if (response.statusCode === 404) {
            this.logger.log(`Cannot find plugin ${url}`, name);
            return reject('not-found' as DownloadRejectionReason);
          } else {
            const file = fs.createWriteStream(zipFilePath);
            response.pipe(file);

            file.on('finish', async () => {
              file.close();
              this.logger.log('Download completed. Extracting...', name);

              const pluginDir = path.resolve(destDir, name!);
              await extract(zipFilePath, { dir: pluginDir });
              fs.rmSync(zipFilePath);

              this.logger.log('Extracting completed', name);

              resolve({
                name: (nameValidation as NameValidation).name,
                pluginFile: path.resolve(pluginDir, 'plugin.yaml'),
                source: url,
                version: (nameValidation as NameValidation).version
              })
            });
          }
        });
      } catch {
        reject('other' as DownloadRejectionReason);
      }
    })
  }

  private validateFileName(file?: string, ext?: string): NameValidation | boolean {
    if (!file) {
      return false;
    }

    if (ext !== '.zip') {
      return false;
    }
    
    const parts = file.split('-')
    if (parts.length < 1) {
      return false;
    }
    
    const version = parts.pop()!;
    
    if (!this.validateVersion(version!)) {
      return false;
    }
    
    const name = parts.join('-');
    return { name, ext, version };
  }

  private validateVersion(version: string): [number, number, number] | false {
    const [major, minor, patch] = version.split('.');

    if (!major || !minor || !patch) {
      return false;
    }

    try {
      return [parseInt(major, 10), parseInt(minor, 10), parseInt(patch, 10)];
    } catch {
      return false;
    }
  }

  private getNameFromUrl(url: string) {
    const filename = path.basename(url);
    const parts = filename.split('.');
    parts.pop();
    return parts.join('.');
  }
}
