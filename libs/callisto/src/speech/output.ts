import { InteractionResponse } from '../models/callisto.models';

export interface SpeechResult {
  promise: Promise<SpeechSynthesisEvent>;
  cancel: () => void;
}

export class SpeechOutputAdapter {
  private onSpeakingListeners: Array<(response: SpeechResult) => void> = [];

  constructor(private readonly noMatchResponse: string = "Sorry, I don't understand") {}

  onSpeaking(listener: (response: SpeechResult) => void) {
    this.onSpeakingListeners.push(listener);
  }

  async speakResponse(response: InteractionResponse): Promise<void> {
    const result = this.speak(response.responseText);
    this.onSpeakingListeners.map(listener => listener(result));
    await result.promise;
  }

  async handleMatchingInteractionFound(found: boolean): Promise<void> {
    if (!found) {
      const result = await this.speak(this.noMatchResponse);
      await result.promise;
    }
  }

  private speak(words: string): SpeechResult {
    const mainVoice = speechSynthesis.getVoices().find(voice => voice.name === 'Samantha');
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
}
