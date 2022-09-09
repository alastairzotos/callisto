import { PluginDto, PluginListItemDto } from "../models";
import { stripSlash } from "../utils/url";

export interface IRegistryService {
  searchRegistry(registryUrl: string, term: string): Promise<PluginListItemDto[]>;
  loadPlugin(registryUrl: string, id: string): Promise<PluginDto>;
}

export class RegistryService implements IRegistryService {
  async searchRegistry(registryUrl: string, term: string): Promise<PluginListItemDto[]> {
    registryUrl = stripSlash(registryUrl);

    const response = await fetch(`${registryUrl}/api/v1/plugins/search?q=${term}`);
    return await response.json();
  }

  async loadPlugin(registryUrl: string, id: string): Promise<PluginDto> {
    registryUrl = stripSlash(registryUrl);

    const response = await fetch(`${registryUrl}/api/v1/plugins/${id}`);
    return await response.json();
  }
}
