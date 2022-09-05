import * as z from 'zod';
import { CallistoContext } from '../callisto';

export type CallistoPlugin = (ctx: CallistoContext) => void;

export const PluginInteractionSchema: z.ZodType<PluginInteraction> = z.lazy(() => z.object({
  inputs: z.array(z.string()),
  resolve: z.string(),
  goToParentContextOnceFinished: z.optional(z.boolean()),
  children: z.optional(z.array(PluginInteractionSchema))
}))

export const PluginImportSchema: z.ZodType<PluginImport> = z.object({
  id: z.string(),
  interactions: z.array(PluginInteractionSchema)
})

export interface PluginImport {
  id: string;
  interactions: PluginInteraction[];
}

export interface PluginInteraction {
  inputs: string[];
  resolve: string;
  children?: PluginInteraction[];
  goToParentContextOnceFinished?: boolean;
}

export interface CallistoPluginResponse {
  type: 'response' | 'question';
  response: string;
  data?: any;
}
