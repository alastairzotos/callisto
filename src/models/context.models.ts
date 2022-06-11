import { CallistoContext } from "../contexts/context";

export interface InteractionResponse {
  responseText: string;
  goToParentContextOnceFinished?: boolean;
  context?: CallistoContext;
}

export type InteractionHandler = (args: string[]) => Promise<InteractionResponse>;

export interface Interaction {
  regex: RegExp;
  handler: InteractionHandler;
}

export type GenericListener = () => void;
export type GenericPromiseListener = () => Promise<void | unknown>;
export type TranscriptListener = (transcript: string) => void;
export type ResponseListener = (response: InteractionResponse) => Promise<void | unknown>;
