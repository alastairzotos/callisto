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

