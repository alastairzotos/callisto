import { CallistoResponse } from '@bitmetro/callisto';
import * as ws from 'ws';
import * as chalk from 'chalk';

import { Container } from './container';
import { InstanceManager } from './instance-manager';
import { Logger } from './logger';

export class WebSocketHandler {
  private logger = Container.resolve(Logger);
  private instanceManager = Container.resolve(InstanceManager);

  constructor(private webSocket: ws.WebSocket) {}

  setupListeners(handle: string) {
    const instance = this.instanceManager.get(handle);
    const callisto = instance.callisto;

    this.webSocket.on('message', async msg => {
      this.logger.log(`Received message: ${chalk.gray(msg)}`, handle);

      const { error, interactionResponse } = await callisto.handleInput(msg.toString());
      this.sendMessage(interactionResponse?.responseText, error, callisto.getContextChain().map(ctx => ctx.getPrompts()).flat());
    })

    this.webSocket.on('close', () => {
      this.logger.log(`Lost connection to ${chalk.yellow(handle)}`, handle);

      this.logger.log(`Killing processes ${this.instanceManager.getProcessIds(handle).map(pid => chalk.gray(pid)).join(', ')}`, handle);

      this.instanceManager.kill(handle);
    })
  }

  sendMessage(text: string | undefined, error: boolean, prompts: string[]) {
    this.webSocket.send(JSON.stringify({ type: 'message', error, text, prompts } as CallistoResponse));
  }

  sendPrompts(prompts: string[]) {
    this.webSocket.send(JSON.stringify({ type: 'prompts', error: false, prompts } as CallistoResponse));
  }
}
