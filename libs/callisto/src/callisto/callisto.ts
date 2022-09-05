import { parse as parseYaml } from 'yaml';

import { CallistoContext } from "./context";
import { ask, stripInputOfExtraChars } from '../utils';
import { CallistoPlugin, ForkProcess, ChildProcess, PluginImport, PluginImportSchema, PluginInteraction, sendAnswer, sendCommand } from '../plugin';
import { InteractionHandlerResponse } from '../models';

export interface CallistoEventHandlers {
  onHandlingInput?: (handlingInput: boolean) => void;
  onResponse?: (response: InteractionHandlerResponse) => Promise<void>;
}

export class CallistoService {
  private rootContext = new CallistoContext();
  private currentContext?: CallistoContext = this.rootContext;

  private eventHandlers: CallistoEventHandlers[] = [];

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
    if (!this.forkProcess) {
      return 'No child process handler set';
    }

    let config: PluginImport =
      format === 'yaml'
        ? parseYaml(configFileContent)
        : JSON.parse(configFileContent);

    this.applyPlugin(ctx => {
      try {
        const { resolve, interactions } = PluginImportSchema.parse(config) as PluginImport;

        const process = this.forkProcess?.(resolve, basePath);

        this.addPluginInteractions(process!, ctx, interactions, basePath);
      } catch (e) {
        console.error(e)
      }
    });
  }

  private addPluginInteractions(
    process: ChildProcess,
    ctx: CallistoContext,
    interactions: PluginInteraction[],
    basePath: string,
  ) {
    interactions.forEach(({ id, inputs, children, goToParentContextOnceFinished }) => {
      ctx.addInteraction(inputs, async params => {
        try {
          const result = await sendCommand(process, id, params);

          if (result.type === 'question') {
            return ask(ctx, result.response, async answer => {
              const answerResult = await sendAnswer(process, answer);
              return answerResult.response!;
            })
          }

          if (!children || children.length === 0) {
            return result.response;
          }

          const subContext = new CallistoContext(ctx);
          this.addPluginInteractions(process, subContext, children, basePath);

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

  addEventHandlers(handlers: CallistoEventHandlers) {
    this.eventHandlers.push(handlers);
  }

  async handleInput(input: string) {
    this.eventHandlers.map(handler => handler.onHandlingInput?.(true));

    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    const response = await this.currentContext.handleInput(stripInputOfExtraChars(input));

    if (response.error) {
      await Promise.all(this.eventHandlers.map(handler => handler.onResponse?.({ error: true })));
    } else {
      await Promise.all(this.eventHandlers.map(handler => handler.onResponse?.({ error: false, interactionResponse: response.interactionResponse })));

      this.currentContext = response.matchingContext;

      if (response.interactionResponse?.goToParentContextOnceFinished) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.eventHandlers.map(handler => handler.onHandlingInput?.(true));
  }
}
