import { forkProcess } from '@bitmetro/callisto-ipc';
import { Callisto, CallistoResponse } from '@bitmetro/callisto';
import * as path from 'path';
import * as fs from 'fs';
import * as ws from 'ws';

export class CallistoServer {
  private wss: ws.WebSocketServer | undefined;

  constructor(
    private readonly options: {
      pluginsRoot: string
    }
  ) {}

  start(port = 8080) {
    this.wss = new ws.WebSocketServer({ port });

    this.wss.on('connection', ws => {
      const callisto = this.createCallistoInstance();

      ws.on('message', async msg => {
        const { error, interactionResponse, matchingContext } = await callisto.handleInput(msg.toString());
        ws.send(JSON.stringify({
          error,
          text: interactionResponse?.responseText,
          prompts: callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
        } as CallistoResponse));
      })

      ws.send(JSON.stringify({
        error: false,
        text: '',
        prompts: callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
      } as CallistoResponse))
    })

    console.log(`Callisto server running on ws://localhost:${port}`);
  }

  private createCallistoInstance() {
    const callisto = new Callisto();
    callisto.setForkProcessHandler(forkProcess);
  
    const importPlugin = (pluginFile: string) => {
      const pluginPath = path.dirname(pluginFile);
      const pluginFileContent = fs.readFileSync(pluginFile).toString();
  
      callisto.importPlugin(pluginFileContent, pluginPath, pluginFile.endsWith('.yaml') || pluginFile.endsWith('.yml') ? 'yaml' : 'json');
    }
  
    fs.readdirSync(this.options.pluginsRoot)
      .map(pluginName => path.resolve(this.options.pluginsRoot, pluginName, 'plugin.yaml'))
      .forEach(importPlugin);
  
    return callisto;
  }
}
