import { parse as parseYaml } from 'yaml';

import { CallistoContext } from "./context";
import { CallistoInputAdapter, CallistoOutputAdapter, ForkProcess } from "../models/callisto.models";
import { ask, stripInputOfExtraChars } from '../utils';
import { CallistoPlugin, PluginImport, PluginImportSchema, PluginInteraction, sendMessage } from '../plugin';

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

  private forkProcess?: ForkProcess;

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

  setForkProcessHandler(handler: ForkProcess) {
    this.forkProcess = handler;
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
        if (!this.forkProcess) {
          return 'No child process handler set';
        }

        try {
          const pluginData = this.pluginData[id] || {};

          const process = this.forkProcess(resolve, params, basePath);
          const result = await sendMessage(process, JSON.stringify({ args: params, data: pluginData }));

          if (result.type === 'question') {
            return ask(ctx, result.response, async answer => {
              const answerResult = await sendMessage(process, answer);
              return answerResult.response!;
            })
          }

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
