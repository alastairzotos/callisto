export const stripSlash = (url: string) => {
  if (url.endsWith('/')) {
    return url.substring(0, url.length - 1);
  }

  return url;
}
