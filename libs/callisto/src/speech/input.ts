import { CEventEmitter } from '../utils';

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
  public onInterim = new CEventEmitter<(transcript: string) => void>();
  public onResult = new CEventEmitter<(transcript: string) => Promise<void>>();
  public onListening = new CEventEmitter<(listening: boolean) => void>();
  public onEnabled = new CEventEmitter<(enabled: boolean) => void>();

  private recognition?: WebkitSpeechRecognition;
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
            this.onInterim.emit(transcript);
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
        this.onInterim.emit('');
        this.onListening.emit(true);
      } catch {
        this.recognition?.abort();
        this.onListening.emit(false);
      }
    }
  }

  private async handleResult(transcript: string) {
    this.recognition?.abort();
    this.setRecognitionEnabled(false);
    this.onListening.emit(false);
    await this.onResult.emit(transcript);
    this.setRecognitionEnabled(true);
  }

  private setRecognitionEnabled(enabled: boolean) {
    this.recognitionEnabled = enabled;
    this.onEnabled.emit(enabled);
  }
}
