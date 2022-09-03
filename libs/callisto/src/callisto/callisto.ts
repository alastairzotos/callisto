import { CallistoContext } from "./context";
import { ResponseListener, TranscriptListener, GenericListener, GenericPromiseListener, ListeningListener, EnabledListener } from "../models/context.models";
import { CallistoPlugin, CallistoPluginInfo } from "../models/service.models";
import { WebkitSpeechRecognition } from "../models/speech.models";
import { IWindow } from "../models/window.model";

export class CallistoService {
  private recognition?: WebkitSpeechRecognition;
  private interimListeners: TranscriptListener[] = [];
  private resultListeners: TranscriptListener[] = [];
  private waitingListeners: GenericListener[] = [];
  private noMatchListeners: GenericPromiseListener[] = [];
  private responseListeners: ResponseListener[] = [];
  private listeningListeners: ListeningListener[] = [];
  private enabledListeners: EnabledListener[] = [];

  private plugins: CallistoPluginInfo[] = [];

  private rootContext = new CallistoContext();
  private currentContext?: CallistoContext = this.rootContext;

  private recognitionEnabled: boolean = true;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
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
            this.onResultTranscript(transcript);
          } else {
            this.onInterimTranscript(transcript);
          }
        };
      }
    }
  }

  startRecognition() {
    if (this.recognitionEnabled) {
      this.recognition?.start();
      this.broadcastListeningStatus(true);
    }
  }

  stopRecognition() {
    if (this.recognitionEnabled) {

      // User will often unclick the button before the speech recognition is finished.
      setTimeout(() => {
        this.recognition?.abort();
        this.broadcastListeningStatus(false);
      }, 3000);
    }
  }


  applyPlugin(plugin: CallistoPlugin) {
    this.plugins.push(plugin(this.rootContext));
  }

  applyPlugins(...plugins: CallistoPlugin[]) {
    plugins.forEach(plugin => this.applyPlugin(plugin));
  }

  getAllPrompts(): string[] {
    return this.plugins.map(plugin => plugin.prompts).flat()
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

  addListeningListener(listener: ListeningListener) {
    this.listeningListeners.push(listener);
  }

  addEnabledListener(listener: EnabledListener) {
    this.enabledListeners.push(listener);
  }

  private setRecognitionEnabled(enabled: boolean) {
    this.recognitionEnabled = enabled;
    this.enabledListeners.forEach(listener => listener(enabled));
  }

  private broadcastListeningStatus(listening: boolean) {
    this.listeningListeners.forEach(listener => listener(listening));
  }

  private onInterimTranscript(transcript: string) {
    this.interimListeners.forEach(listener => listener(transcript));
  }

  private async onResultTranscript(transcript: string) {
    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    this.recognition?.abort();
    this.setRecognitionEnabled(false);
    this.broadcastListeningStatus(false);

    this.resultListeners.forEach(listener => listener(transcript));
    this.waitingListeners.forEach(listener => listener());

    const response = await this.currentContext.handleTranscript(transcript);

    if (response.error) {
      await Promise.all(this.noMatchListeners.map(listener => listener()));
    } else if (response.interactionResponse) {
      await Promise.all(
        this.responseListeners.map(listener => listener(response.interactionResponse!))
      )

      this.currentContext = response.matchingContext;

      if (response.interactionResponse.goToParentContextOnceFinished) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.setRecognitionEnabled(true);
  }
}
