import { CallistoContext } from "../contexts/context";

export interface InteractionResponse {
  responseText: string;
  /** Will send us back to the parent context once the interaction is handled. If false, stay in the current context */
  break?: boolean;
  context?: CallistoContext;
}

export type InteractionHandler = (args: string[]) => Promise<InteractionResponse>;

export interface Interaction {
  regex: RegExp;
  handler: InteractionHandler;
}

export type GenericListener = () => void;
export type GenericPromiseListener = () => Promise<void>;
export type TranscriptListener = (transcript: string) => void;
export type ResponseListener = (response: InteractionResponse) => Promise<void>;
