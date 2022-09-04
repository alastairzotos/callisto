import { CallistoContext } from "./context";
import { CallistoInputAdapter, CallistoOutputAdapter, InteractionResponse } from "../models/callisto.models";
import { CallistoPlugin, CallistoPluginInfo } from "../models";
import { stripInputOfExtraChars } from '../utils';

export interface CallistoEventHandlers {
  onHandlingInput?: (handlingInput: boolean) => void;
}

export class CallistoService {
  private rootContext = new CallistoContext();
  private currentContext?: CallistoContext = this.rootContext;
  
  private plugins: CallistoPluginInfo[] = [];
  private onHandlingInputListeners: Array<(handlingInput: boolean) => void> = [];
  private inputAdapters: CallistoInputAdapter[] = [];
  private outputAdapters: CallistoOutputAdapter[] = [];

  applyPlugin(plugin: CallistoPlugin) {
    this.plugins.push(plugin(this.rootContext));
  }

  applyPlugins(...plugins: CallistoPlugin[]) {
    plugins.forEach(plugin => this.applyPlugin(plugin));
  }

  getAllPrompts(): string[] {
    return this.plugins.map(plugin => plugin.prompts).flat()
  }

  onHandlingInput(listener: (handlingInput: boolean) => void) {
    this.onHandlingInputListeners.push(listener);
  }

  registerInputAdapter(adapter: CallistoInputAdapter) {
    this.inputAdapters.push(adapter);
    adapter.register(this);
  }

  registerOutputAdapter(adapter: CallistoOutputAdapter) {
    this.outputAdapters.push(adapter);
    adapter.register(this);
  }

  async handleInput(input: string) {
    this.onHandlingInputListeners.map(handler => handler(true));

    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    const response = await this.currentContext.handleInput(stripInputOfExtraChars(input));

    if (response.error) {
      await Promise.all(this.outputAdapters.map(adapter => adapter.handleMatchingInteractionFound(false)));
    } else {
      await Promise.all(this.outputAdapters.map(adapter => adapter.handleMatchingInteractionFound(true)));
      await Promise.all(this.outputAdapters.map(adapter => adapter.handleResponse(response.interactionResponse)));

      this.currentContext = response.matchingContext;

      if (response.interactionResponse.goToParentContextOnceFinished) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.onHandlingInputListeners.map(handler => handler(false));
  }
}
