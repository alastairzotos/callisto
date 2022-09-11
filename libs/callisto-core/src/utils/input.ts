export const stripInputOfExtraChars = (input: string) => {
  const trimChars = '[\\?\\!\\.\\s]';
  const regex = new RegExp(`^${trimChars}*|${trimChars}*$`, 'g');
  return input
    .toLocaleLowerCase()
    .replace(regex, '')
    .replace(/(\s)+/g, ' ');
}
