import { Callisto } from "../callisto/callisto";
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

export interface CallistoResponse {
  error: boolean;
  text: string;
}

export class CallistoAdapter {
  public callisto: Callisto | undefined;

  register(callisto: Callisto) {
    this.callisto = callisto;
  }
}
