import { forkProcess } from '@bitmetro/callisto-plugins';
import { ask, Callisto, CallistoContext, CallistoResponse, ChildProcess } from '@bitmetro/callisto';
import * as path from 'path';
import * as fs from 'fs';
import * as ws from 'ws';
import { parse as parseYaml } from 'yaml';
import { execSync } from 'child_process';

import { sendAnswer, sendCommand } from './ipc';
import { PluginImport, PluginImportSchema, PluginInteraction } from './models';

const addPluginInteractions = (
  process: ChildProcess,
  ctx: CallistoContext,
  interactions: PluginInteraction[],
  basePath: string,
) => {
  interactions.forEach(({ id, prompts, inputs, children, goToParentContextOnceFinished }) => {
    ctx.addPrompts(prompts || []);
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
        addPluginInteractions(process, subContext, children, basePath);

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

const handlePluginImport = (callisto: Callisto, name: string, configFileContent: string, basePath: string, format: 'json' | 'yaml') => {
  console.log(`Importing plugin '${name}'`);

  let config: PluginImport =
    format === 'yaml'
      ? parseYaml(configFileContent)
      : JSON.parse(configFileContent);

  console.log(basePath);

  console.log('Installing dependencies');
  execSync('npm i', { cwd: basePath, stdio: 'inherit' });

  console.log('Building');
  execSync('npm run build', { cwd: basePath, stdio: 'inherit' });

  callisto.applyPlugin(ctx => {
    try {
      const { resolve, interactions } = PluginImportSchema.parse(config) as PluginImport;

      console.log('Starting');
      const process = forkProcess?.(resolve, basePath);

      addPluginInteractions(process!, ctx, interactions, basePath);
    } catch (e) {
      console.error(e)
    }
  });
}

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
        const { error, interactionResponse } = await callisto.handleInput(msg.toString());
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
  
    const importPlugin = (pluginFile: string) => {
      const pluginPath = path.dirname(pluginFile);
      const pluginFileContent = fs.readFileSync(pluginFile).toString();
  
      handlePluginImport(callisto, path.basename(pluginPath), pluginFileContent, pluginPath, pluginFile.endsWith('.yaml') || pluginFile.endsWith('.yml') ? 'yaml' : 'json');
    }
  
    fs.readdirSync(this.options.pluginsRoot)
      .map(pluginName => path.resolve(this.options.pluginsRoot, pluginName, 'plugin.yaml'))
      .forEach(importPlugin);
  
    return callisto;
  }
}
