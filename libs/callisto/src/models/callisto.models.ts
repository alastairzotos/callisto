import { CallistoService } from "../callisto/callisto";
import { CallistoContext } from "../callisto/context";

export interface InteractionResponse {
  responseText: string;
  goToParentContextOnceFinished?: boolean;
  context?: CallistoContext;
}

export type InteractionHandler = (args: string[]) => Promise<InteractionResponse | string>;

export interface Interaction {
  regex: RegExp;
  handler: InteractionHandler;
}

export interface InteractionHandlerResponse {
  error: boolean;
  interactionResponse?: InteractionResponse;
  matchingContext?: CallistoContext;
}

export interface CallistoPluginInfo {
  prompts: string[];
}

export type CallistoPlugin = (ctx: CallistoContext) => CallistoPluginInfo;

export class CallistoAdapter {
  public callisto: CallistoService;

  register(callisto: CallistoService) {
    this.callisto = callisto;
  }
}

export class CallistoInputAdapter extends CallistoAdapter {
  handleInput(input: string): void {
    this.callisto.handleInput(input);
  }
}

export class CallistoOutputAdapter extends CallistoAdapter {
  constructor(public readonly noMatchResponse = "Sorry, I don't understand.") {
    super();
  }

  async handleResponse(response: InteractionResponse): Promise<void> {}
  async handleMatchingInteractionFound(found: boolean): Promise<void> {}
}