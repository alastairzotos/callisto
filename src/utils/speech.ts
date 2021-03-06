const mainVoice = speechSynthesis.getVoices().find(voice => voice.name === 'Samantha');

export const speak = (words: string) => new Promise((resolve) => {
  const utterance = new SpeechSynthesisUtterance(words);
  utterance.onend = resolve;
  speechSynthesis.speak(utterance);
});
