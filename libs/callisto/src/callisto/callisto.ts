import { parse as parseYaml } from 'yaml';

import { CallistoContext } from "./context";
import { CallistoInputAdapter, CallistoOutputAdapter, ChildProcessHandler } from "../models/callisto.models";
import { stripInputOfExtraChars } from '../utils';
import { CallistoPlugin, PluginImport, PluginImportSchema, PluginInteraction } from '../plugin';

export interface CallistoEventHandlers {
  onHandlingInput?: (handlingInput: boolean) => void;
}

export class CallistoService {
  private rootContext = new CallistoContext();
  private currentContext?: CallistoContext = this.rootContext;

  private onHandlingInputListeners: Array<(handlingInput: boolean) => void> = [];
  private inputAdapters: CallistoInputAdapter[] = [];
  private outputAdapters: CallistoOutputAdapter[] = [];

  public pluginData: { [key: string]: any } = {};

  private childProcessHandler?: ChildProcessHandler;

  applyPlugin(plugin: CallistoPlugin) {
    plugin(this.rootContext);
  }

  applyPlugins(...plugins: CallistoPlugin[]) {
    plugins.forEach(plugin => this.applyPlugin(plugin));
  }

  getContextChain(): CallistoContext[] {
    const chain: CallistoContext[] = [];
    let context = this.currentContext;

    while (context) {
      chain.push(context);
      context = context.parent;
    }

    return chain;
  }

  setChildProcessHandler(handler: ChildProcessHandler) {
    this.childProcessHandler = handler;
  }

  importPlugin(configFileContent: string, basePath: string, format: 'json' | 'yaml') {
    let config: PluginImport =
      format === 'yaml'
        ? parseYaml(configFileContent)
        : JSON.parse(configFileContent);

    this.applyPlugin(ctx => {
      try {
        config = PluginImportSchema.parse(config) as PluginImport;
        this.addPluginInteractions(config.id, ctx, config.interactions, basePath);
      } catch (e) {
        console.error(e)
      }
    });
  }

  private addPluginInteractions(
    id: string,
    ctx: CallistoContext,
    interactions: PluginInteraction[],
    basePath: string,
  ) {
    interactions.forEach(({ inputs, resolve, children, goToParentContextOnceFinished }) => {
      ctx.addInteraction(inputs, async params => {
        const encodedSubcontextData = Buffer.from(JSON.stringify(this.pluginData[id] || {})).toString('base64');

        if (!this.childProcessHandler) {
          return 'No child process handler set';
        }

        try {
          const result = await this.childProcessHandler(resolve, [...params, encodedSubcontextData], basePath);

          this.pluginData[id] = result.data;

          if (!children || children.length === 0) {
            return result.response;
          }

          const subContext = new CallistoContext(ctx);
          this.addPluginInteractions(id, subContext, children, basePath);

          return {
            responseText: result.response,
            goToParentContextOnceFinished,
            context: subContext
          }
        } catch {
          return 'There was an error handling your request'
        }
      })
    })
  }

  onHandlingInput(listener: (handlingInput: boolean) => void) {
    this.onHandlingInputListeners.push(listener);
  }

  registerInputAdapter(adapter: CallistoInputAdapter) {
    this.inputAdapters.push(adapter);
    adapter.register(this);
  }

  registerOutputAdapter(adapter: CallistoOutputAdapter) {
    this.outputAdapters.push(adapter);
    adapter.register(this);
  }

  async handleInput(input: string) {
    this.onHandlingInputListeners.map(handler => handler(true));

    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    const response = await this.currentContext.handleInput(stripInputOfExtraChars(input));

    if (response.error) {
      await Promise.all(this.outputAdapters.map(adapter => adapter.handleMatchingInteractionFound(false)));
    } else {
      await Promise.all(this.outputAdapters.map(adapter => adapter.handleMatchingInteractionFound(true)));
      await Promise.all(this.outputAdapters.map(adapter => adapter.handleResponse(response.interactionResponse)));

      this.currentContext = response.matchingContext;

      if (response.interactionResponse?.goToParentContextOnceFinished) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.onHandlingInputListeners.map(handler => handler(false));
  }
}
