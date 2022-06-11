import { CallistoContext } from "../contexts/context";
import { ResponseListener, TranscriptListener, GenericListener, GenericPromiseListener } from "../models/context.models";
import { CallistoPlugin } from "../models/service.models";
import { WebkitSpeechRecognition } from "../models/speech.models";
import { IWindow } from "../models/window.model";

export class CallistoService {
  private recognition?: WebkitSpeechRecognition;
  private interimListeners: TranscriptListener[] = [];
  private resultListeners: TranscriptListener[] = [];
  private waitingListeners: GenericListener[] = [];
  private noMatchListeners: GenericPromiseListener[] = [];
  private responseListeners: ResponseListener[] = [];
  private currentContext?: CallistoContext;

  constructor(private rootContext: CallistoContext) {
    this.currentContext = rootContext;

    if ('webkitSpeechRecognition' in window) {
      const { webkitSpeechRecognition } = window as unknown as IWindow;

      this.recognition = new webkitSpeechRecognition();

      if (this.recognition) {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          const result = event.results[event.resultIndex];

          const transcript = result[0].transcript.trim().toLocaleLowerCase();

          if (result.isFinal) {
            this.onResulTranscript(transcript);
          } else {
            this.onInterimTranscript(transcript);
          }
        };

        this.recognition.start();
      }
    }
  }

  applyPlugin(plugin: CallistoPlugin) {
    plugin(this.rootContext)
  }

  applyPlugins(...plugins: CallistoPlugin[]) {
    plugins.forEach(plugin => this.applyPlugin(plugin));
  }

  addInterimListener(listener: TranscriptListener) {
    this.interimListeners.push(listener);
  }

  addFinalResultListener(listener: TranscriptListener) {
    this.resultListeners.push(listener);
  }

  addWaitingListener(listener: GenericListener) {
    this.waitingListeners.push(listener);
  }

  addNoMatchListener(listener: GenericPromiseListener) {
    this.noMatchListeners.push(listener);
  }

  addResponseListener(listener: ResponseListener) {
    this.responseListeners.push(listener);
  }

  private onInterimTranscript(transcript: string) {
    this.interimListeners.forEach(listener => listener(transcript));
  }

  private async onResulTranscript(transcript: string) {
    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    this.resultListeners.forEach(listener => listener(transcript));
    this.waitingListeners.forEach(listener => listener());

    this.recognition?.abort();

    const response = await this.currentContext.handleTranscript(transcript);

    if (response.error) {
      await Promise.all(this.noMatchListeners.map(listener => listener()));
    } else if (response.interactionResponse) {
      await Promise.all(
        this.responseListeners.map(listener => listener(response.interactionResponse!))
      )

      this.currentContext = response.matchingContext;

      if (response.interactionResponse.break) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.recognition?.start();
  }
}
