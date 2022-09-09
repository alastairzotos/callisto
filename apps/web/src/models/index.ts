export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting';
export type FetchStatus = 'fetching' | 'success' | 'failure';

export type ServersList = { [name: string]: string };

export interface PluginVersion {
  version: string;
  fileName: string;
  url: string;
}

export interface PluginDto {
  _id: string;
  name: string;
  versions: PluginVersion[];
}

export type PluginListItemDto = Pick<PluginDto, '_id' | 'name'>;
