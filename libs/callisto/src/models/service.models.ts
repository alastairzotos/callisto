import { CallistoContext } from "../callisto/context";

export interface CallistoPluginInfo {
  prompts: string[];
}

export type CallistoPlugin = (ctx: CallistoContext) => CallistoPluginInfo;
