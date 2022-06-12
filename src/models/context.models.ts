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

export type GenericListener = () => void;
export type GenericPromiseListener = () => Promise<void | unknown>;
export type TranscriptListener = (transcript: string) => void;
export type ResponseListener = (response: InteractionResponse) => Promise<void | unknown>;
export type ListeningListener = (listening: boolean) => void;
export type EnabledListener = (listening: boolean) => void;
