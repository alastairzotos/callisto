const mainVoice = speechSynthesis.getVoices().find(voice => voice.name === 'Samantha');

export interface SpeechResult {
  promise: Promise<SpeechSynthesisEvent>;
  cancel: () => void;
}

export const speak = (words: string): SpeechResult => {
  const utterance = new SpeechSynthesisUtterance(words);
  utterance.voice = mainVoice!;

  return {
    promise: new Promise((resolve) => {
      utterance.onend = resolve;
      speechSynthesis.speak(utterance)
    }),

    cancel: () => speechSynthesis.cancel()
  }
}
