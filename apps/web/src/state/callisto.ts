import { CallistoBrowserClient } from '@bitmetro/callisto-client';
import create from 'zustand';
import { ConnectionStatus, FetchStatus, PluginDto, PluginListItemDto, ServersList } from '../models';
import { CallistoService, ICallistoService } from '../services/callisto.service';
import { IRegistryService, RegistryService } from '../services/registry.service';
import { getLocalStorage, hasLocalStorage, setLocalStorage } from '../utils/localstorage';
import { useSpeech } from './speech';

const SELECTED_SERVER_KEY = 'callisto:selected-server';
const SERVERS_KEY = 'callisto:known-servers';
const REGISTRY_KEY = 'callisto:registry';

interface CallistoValues {
  client?: CallistoBrowserClient;

  knownServers?: ServersList,
  selectedServerName?: string,
  connectionStatus: ConnectionStatus;

  registry?: string;
  pluginSearchStatus?: FetchStatus;
  pluginSearchResults: PluginListItemDto[];
  selectedPluginRef?: PluginListItemDto;
  pluginLoadStatus?: FetchStatus;
  selectedPlugin?: PluginDto;
  installStatus?: FetchStatus;

  interimText: string;
  speechResultText: string;
  responseText: string;

  prompts: string[];
}

interface CallistoActions {
  configure: () => void;
  createClient: () => void;

  setConnectionStatus: (status: ConnectionStatus) => void;
  setSelectedServer: (name: string) => void;
  addServer: (name: string, host: string) => void;
  modifyServer: (oldName: string, newName: string, host: string) => void;

  setRegistry: (url: string) => void;
  searchPlugins: (term: string) => Promise<void>;
  selectPlugin: (ref?: PluginListItemDto) => Promise<void>;
  installSelectedPlugin: () => Promise<void>;

  setInterimText: (text: string) => void;
  setSpeechResultText: (text: string) => void;
  setResponseText: (text: string) => void;
}

type CallistoState = CallistoValues & CallistoActions;

const defaultServers = {
  bitmetro: 'wss://callisto-server.bitmetro.io'
};

const createCallistoState = (initialValues: CallistoValues, registryService: IRegistryService, callistoService: ICallistoService) =>
  create<CallistoState>((set, self) => ({
    ...initialValues,

    configure: () => {
      const encodedDefaultServers = JSON.stringify(defaultServers);

      if (!hasLocalStorage(SERVERS_KEY)) {
        setLocalStorage(SERVERS_KEY, encodedDefaultServers);
      }

      const knownServers: { [key: string]: string } = JSON.parse(getLocalStorage(SERVERS_KEY))

      set({
        knownServers,
        selectedServerName: getLocalStorage(SELECTED_SERVER_KEY, 'bitmetro'),
        registry: getLocalStorage(REGISTRY_KEY)
      })
    },

    createClient: () => {
      const client = new CallistoBrowserClient({ host: self().knownServers![self().selectedServerName || 'bitmetro'], retryTimeout: 3000 });

      set({
        client,
        interimText: '',
        speechResultText: '',
        responseText: ''
      });

      client.onMessage.attach(async ({ type, error, text, prompts }) => {
        const speechState = useSpeech.getState();

        if (type === 'message') {
          if (error) {
            set({ responseText: `Sorry, I don't understand` });
            await speechState.output?.speakResponse(`Sorry, I don't understand`);
          } else if (text) {
            set({ responseText: text });
            await speechState.output?.speakResponse(text);
          }
        } else {
          set({ prompts });
        }
      })

      client.onConnected.attach(() => set({ connectionStatus: 'connected' }));
      client.onClose.attach(() => set({ connectionStatus: 'reconnecting' }));

      client.connect();
    },

    setSelectedServer: serverName => {
      setLocalStorage(SELECTED_SERVER_KEY, serverName);
      set({ selectedServerName: serverName });
      self().createClient();
    },

    addServer: (name, host) => {
      const newKnownServers = {
        ...self().knownServers,
        [name]: host
      };

      setLocalStorage(SERVERS_KEY, JSON.stringify(newKnownServers));

      set({ knownServers: newKnownServers })
    },

    modifyServer: (oldName, newName, host) => {
      const newKnownServers = {
        ...self().knownServers,
        [newName]: host
      };

      delete newKnownServers[oldName];

      setLocalStorage(SERVERS_KEY, JSON.stringify(newKnownServers));

      set({ knownServers: newKnownServers })
    },

    setConnectionStatus: status => set({ connectionStatus: status }),

    setRegistry: url => {
      set({ registry: url });
      setLocalStorage(REGISTRY_KEY, url);
    },

    searchPlugins: async (term) => {
      try {
        set({ pluginSearchStatus: 'fetching' })

        if (self().registry) {
          const pluginSearchResults = await registryService.searchRegistry(self().registry!, term);

          set({ pluginSearchStatus: 'success', pluginSearchResults })
        } else {
          set({ pluginSearchStatus: 'success' })
        }
      } catch {
        set({ pluginSearchStatus: 'failure' })
      }
    },

    selectPlugin: async (ref) => {
      if (ref) {
        try {
          set({ selectedPluginRef: ref, pluginLoadStatus: 'fetching' })

          const plugin = await registryService.loadPlugin(self().registry!, ref._id);

          set({ pluginLoadStatus: 'success', selectedPlugin: plugin });
        } catch {
          set({ pluginLoadStatus: 'failure' });
        }
      } else {
        set({ selectedPluginRef: undefined, selectedPlugin: undefined, pluginLoadStatus: undefined })
      }
    },

    installSelectedPlugin: async () => {
      try {
        set({ installStatus: 'fetching' })

        const currentServer = self().knownServers?.[self().selectedServerName!];

        if (currentServer && self().selectedPlugin) {
          await callistoService.installPlugin(currentServer, self().selectedPlugin!)
        }

        set({ installStatus: 'success', selectedPluginRef: undefined, selectedPlugin: undefined, pluginLoadStatus: undefined })
      } catch {
        set({ installStatus: 'failure' })
      }
    },

    setInterimText: text => set({ interimText: text }),
    setSpeechResultText: text => set({ speechResultText: text }),
    setResponseText: text => set({ responseText: text }),
  }))

export const useCallisto = createCallistoState({
  connectionStatus: 'connecting',

  interimText: '',
  speechResultText: '',
  responseText: '',

  prompts: [],

  pluginSearchResults: []
}, new RegistryService(), new CallistoService());
