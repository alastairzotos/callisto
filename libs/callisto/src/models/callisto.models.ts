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

export class CallistoAdapter {
  public callisto: CallistoService | undefined;

  register(callisto: CallistoService) {
    this.callisto = callisto;
  }
}

export class CallistoInputAdapter extends CallistoAdapter {
  protected resultHandler: (input: string) => Promise<void> = async input => await this.callisto?.handleInput(input);

  setResultHandler(handler: (input: string) => Promise<void>) {
    this.resultHandler = handler;
  }

  async handleInput(input: string): Promise<void> {
    await this.resultHandler?.(input);
  }
}

export class CallistoOutputAdapter extends CallistoAdapter {
  constructor(public readonly noMatchResponse = "Sorry, I don't understand.") {
    super();
  }

  async handleResponse(response?: InteractionResponse): Promise<void> {}
  async handleMatchingInteractionFound(found: boolean): Promise<void> {}
}

export interface ChildProcess {
  send: (message: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => ChildProcess;
}

export type ForkProcess = (cmd: string, args: string[], cwd: string) => ChildProcess;
