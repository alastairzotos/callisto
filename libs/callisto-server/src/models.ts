import { Callisto } from '@bitmetro/callisto';
import { ChildProcess } from 'child_process';
import * as z from 'zod';

export const PluginInteractionSchema: z.ZodType<PluginInteraction> = z.lazy(() => z.object({
  id: z.string(),
  prompts: z.optional(z.array(z.string())),
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
  prompts?: string[];
  inputs: string[];
  children?: PluginInteraction[];
  goToParentContextOnceFinished?: boolean;
}

export type PluginProcesses = { [pluginName: string]: ChildProcess | undefined };

export interface Instance {
  callisto: Callisto;
  processes: PluginProcesses;
}

export interface ManifestItem {
  name: string;
  version: string;
  source: string;
  pluginFile: string;
}

export type DownloadRejectionReason = 'not-found' | 'bad-format' | 'other';

export type UninstallRejectionReason = 'no-plugin';
