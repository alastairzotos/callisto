import { PluginDto } from "../models";
import { stripSlash } from "../utils/url";

export interface ICallistoService {
  installPlugin(serverUrl: string, plugin: PluginDto): Promise<void>;
}

export class CallistoService implements ICallistoService {
  async installPlugin(serverUrl: string, plugin: PluginDto): Promise<void> {
    serverUrl = stripSlash(serverUrl);
    serverUrl = serverUrl.replace('ws://', 'http://').replace('wss://', 'https://');

    await fetch(`${serverUrl}/download?url=${encodeURIComponent(plugin.versions[plugin.versions.length - 1].url)}`)
  }
}
