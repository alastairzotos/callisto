import { Callisto } from '@bitmetro/callisto';
import { ChildProcess } from 'child_process';
import { WebSocketHandler } from './ws-handler';

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
  ws: WebSocketHandler;
}

export interface ManifestItem {
  name: string;
  version: string;
  source: string;
  pluginFile: string;
}

export type DownloadRejectionReason = 'not-found' | 'bad-format' | 'other';

export type UninstallRejectionReason = 'no-plugin';

export interface PluginRef {
  name: string;
  fullName: string;
  resolve: string;
  pluginPath: string;
  interactions: PluginInteraction[];
}