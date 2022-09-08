import * as path from 'path';

export const extractName = (url: string) => {
  const filename = path.basename(url);
  const parts = filename.split('-');
  parts.pop();
  return parts.join('-');
}
