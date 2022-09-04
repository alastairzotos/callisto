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

export type CallistoPlugin = (ctx: CallistoContext) => void;

export class CallistoAdapter {
  public callisto: CallistoService;

  register(callisto: CallistoService) {
    this.callisto = callisto;
  }
}

export class CallistoInputAdapter extends CallistoAdapter {
  async handleInput(input: string): Promise<void> {
    await this.callisto.handleInput(input);
  }
}

export class CallistoOutputAdapter extends CallistoAdapter {
  constructor(public readonly noMatchResponse = "Sorry, I don't understand.") {
    super();
  }

  async handleResponse(response: InteractionResponse): Promise<void> {}
  async handleMatchingInteractionFound(found: boolean): Promise<void> {}
}