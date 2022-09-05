import * as z from 'zod';
import { CallistoContext } from '../callisto';

export type CallistoPlugin = (ctx: CallistoContext) => void;

export const PluginInteractionSchema: z.ZodType<PluginInteraction> = z.lazy(() => z.object({
  id: z.string(),
  inputs: z.array(z.string()),
  goToParentContextOnceFinished: z.optional(z.boolean()),
  children: z.optional(z.array(PluginInteractionSchema))
}))

export const PluginImportSchema: z.ZodType<PluginImport> = z.object({
  resolve: z.string(),
  interactions: z.array(PluginInteractionSchema)
})

export interface PluginImport {
  resolve: string;
  interactions: PluginInteraction[];
}

export interface PluginInteraction {
  id: string;
  inputs: string[];
  children?: PluginInteraction[];
  goToParentContextOnceFinished?: boolean;
}

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
