import { CallistoContext } from "./context";
import { stripInputOfExtraChars, CEventEmitter } from '../utils';
import { CallistoPlugin, InteractionHandlerResponse } from '../models';

export class Callisto {
  public onProcessing = new CEventEmitter<(processing: boolean) => void>();

  private rootContext = new CallistoContext();
  private currentContext?: CallistoContext = this.rootContext;

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

  async handleInput(input: string) {
    this.onProcessing.emit(true);

    if (!this.currentContext) {
      this.currentContext = this.rootContext;
    }

    const response = await this.currentContext.handleInput(stripInputOfExtraChars(input));
    let result: InteractionHandlerResponse;

    if (response.error) {
      result = { error: true };
    } else {
      result = { error: false, interactionResponse: response.interactionResponse, matchingContext: response.matchingContext };

      this.currentContext = response.matchingContext;

      if (response.interactionResponse?.goToParentContextOnceFinished) {
        this.currentContext = this.currentContext?.parent;
      }
    }

    this.onProcessing.emit(false);

    return result;
  }
}
