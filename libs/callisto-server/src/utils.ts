import * as path from 'path';
import { exec } from 'child_process';

export const extractName = (url: string) => {
  const filename = path.basename(url);
  const parts = filename.split('-');
  parts.pop();
  return parts.join('-');
}

export const execAsync = (cmd: string, cwd: string) => new Promise<void>((resolve, reject) => {
  exec(cmd, { cwd }, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return reject(err);
    }

    console.log(stdout);
    resolve();
  })
})
