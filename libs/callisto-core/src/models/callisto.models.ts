import { Callisto } from "../callisto/callisto";
import { CallistoContext } from "../callisto/context";

export interface InteractionResponse {
  responseText: string;
  goToParentContextOnceFinished?: boolean;
  context?: CallistoContext;
}

export type InteractionHandler = (args: string[]) => Promise<InteractionResponse | string>;

export interface Interaction {
  pluginId: string;
  regex: RegExp;
  handler: InteractionHandler;
}

export interface InteractionHandlerResponse {
  error: boolean;
  interactionResponse?: InteractionResponse;
  matchingContext?: CallistoContext;
}

export type CallistoResponseType = 'message' | 'prompts';

export interface CallistoResponse {
  type: CallistoResponseType;
  error: boolean;
  text?: string;
  prompts?: string[];
  progress?: number;
}

export type CallistoPlugin = (ctx: CallistoContext) => void;

export interface CallistoPluginResponse {
  type: 'response' | 'question';
  response: string;
}

export interface CallistoPluginMessage {
  type: 'input' | 'answer';
  interactionId?: string;
  args?: (string | undefined)[];
  answer?: string;
}
