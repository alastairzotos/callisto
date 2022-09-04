import { CallistoContext } from "./context";
import { CallistoInputAdapter, InteractionResponse } from "../models/callisto.models";
import { CallistoPlugin, CallistoPluginInfo } from "../models";

export interface CallistoEventHandlers {
  onMatchingInteractionFound?: (matchFound: boolean) => Promise<void | unknown>;
  onResponse?: (response: InteractionResponse) => Promise<void | unknown>;
  onHandlingInput?: (handlingInput: boolean) => void;
}

export class CallistoService {
  private rootContext = new CallistoContext();
  private currentContext?: CallistoContext = this.rootContext;
  
  private plugins: CallistoPluginInfo[] = [];
  private inputAdapters: CallistoInputAdapter[] = [];
  private eventHandlers: CallistoEventHandlers[] = [];

  applyPlugin(plugin: CallistoPlugin) {
    this.plugins.push(plugin(this.rootContext));
  }

  applyPlugins(...plugins: CallistoPlugin[]) {
    plugins.forEach(plugin => this.applyPlugin(plugin));
  }

  getAllPrompts(): string[] {
    return this.plugins.map(plugin => plugin.prompts).flat()
  }

  addEventHandlers(handlers: CallistoEventHandlers) {
    this.eventHandlers.push(handlers);
  }

  addInputAdapter(adapter: CallistoInputAdapter) {
    this.inputAdapters.push(adapter);
    adapter.register(this);
  }

  async handleInput(input: string) {
    this.eventHandlers.map(handler => handler.onHandlingInput?.(true));

    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    const response = await this.currentContext.handleInput(input);

    if (response.error) {
      await Promise.all(this.eventHandlers.map(handler => handler.onMatchingInteractionFound?.(false)));
    } else {
      await Promise.all(this.eventHandlers.map(handler => handler.onMatchingInteractionFound?.(true)));
      await Promise.all(this.eventHandlers.map(handler => handler.onResponse?.(response.interactionResponse)));

      this.currentContext = response.matchingContext;

      if (response.interactionResponse.goToParentContextOnceFinished) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.eventHandlers.map(handler => handler.onHandlingInput?.(false));
  }
}
