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
  prompts: string[];
}

export type CallistoPlugin = (ctx: CallistoContext) => void;

export interface CallistoPluginResponse {
  type: 'response' | 'question';
  response: string;
}

export interface CallistoPluginMessage {
  type: 'cmd' | 'answer';
  interactionId?: string;
  args?: (string | undefined)[];
  answer?: string;
}

export interface ChildProcess {
  send: (message: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => ChildProcess;
}

export type ForkProcess = (cmd: string, cwd: string) => ChildProcess;
