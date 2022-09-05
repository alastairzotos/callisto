export interface WebkitSpeechRecognitionResultEvent {
  results: WebkitSpeechRecognitionResult[];
  resultIndex: number;
}

export interface WebkitSpeechRecognitionResult {
  [key: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface WebkitSpeechRecognition {
  new(): WebkitSpeechRecognition;

  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: () => void;
  onresult: (event: WebkitSpeechRecognitionResultEvent) => void;
  start: () => void;
  abort: () => void;
}

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

export interface SpeechInputEventHandlers {
  onInterim?: (transcript: string) => void;
  onResult?: (transcript: string) => Promise<void>;
  onListening?: (listening: boolean) => void;
  onEnabled?: (enabled: boolean) => void;
}

export class SpeechInputAdapter {
  private recognition?: WebkitSpeechRecognition;
  private eventHandlers: SpeechInputEventHandlers[] = [];
  private recognitionEnabled: boolean = true;

  constructor() {
    if (typeof window !== undefined && 'webkitSpeechRecognition' in window) {
      const { webkitSpeechRecognition } = window as unknown as IWindow;

      this.recognition = new webkitSpeechRecognition();

      if (this.recognition) {
        // this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          const result = event.results[event.resultIndex];

          const transcript = result[0].transcript.trim().toLocaleLowerCase();

          if (result.isFinal) {
            this.handleResult(transcript);
          } else {
            this.eventHandlers.map(handler => handler.onInterim?.(transcript));
          }
        };
      }
    }
  }

  startRecognition() {
    if (this.recognitionEnabled) {
      try {
        this.recognition?.abort();
        this.recognition?.start();
        this.eventHandlers.map(handler => handler.onInterim?.(''));
        this.eventHandlers.map(handler => handler.onListening?.(true));
      } catch {
        this.recognition?.abort();
        this.eventHandlers.map(handler => handler.onListening?.(false));
      }
    }
  }

  addEventHandlers(handlers: SpeechInputEventHandlers) {
    this.eventHandlers.push(handlers);
  }

  private async handleResult(transcript: string) {
    this.recognition?.abort();
    this.setRecognitionEnabled(false);
    this.eventHandlers.map(handler => handler.onListening?.(false));
    await Promise.all(this.eventHandlers.map(handler => handler.onResult?.(transcript)))
    this.setRecognitionEnabled(true);
  }

  private setRecognitionEnabled(enabled: boolean) {
    this.recognitionEnabled = enabled;
    this.eventHandlers.map(handler => handler.onEnabled?.(enabled));
  }
}
