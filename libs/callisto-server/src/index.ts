import { forkProcess } from '@bitmetro/callisto-plugins';
import { ask, Callisto, CallistoContext, CallistoResponse, ChildProcess } from '@bitmetro/callisto';
import * as path from 'path';
import * as fs from 'fs';
import * as ws from 'ws';
import { parse as parseYaml } from 'yaml';
import { execSync } from 'child_process';

import { sendAnswer, sendCommand } from './ipc';
import { PluginImport, PluginImportSchema, PluginInteraction } from './models';


interface PluginRef {
  name: string;
  resolve: string;
  pluginPath: string;
  interactions: PluginInteraction[];
}

export class CallistoServer {
  private wss: ws.WebSocketServer | undefined;
  private plugins: PluginRef[] = [];

  constructor(
    private readonly options: {
      pluginsRoot: string
    }
  ) { }

  start(port = 8080) {
    this.importPlugins();

    this.wss = new ws.WebSocketServer({ port });

    this.wss.on('connection', ws => {
      const callisto = new Callisto();
      this.plugins.forEach(plugin => this.applyPlugin(callisto, plugin));

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

  private importPlugins() {
    fs.readdirSync(this.options.pluginsRoot)
      .map(pluginName => path.resolve(this.options.pluginsRoot, pluginName, 'plugin.yaml'))
      .forEach(pluginFile => this.importPlugin(pluginFile));
  }

  private importPlugin(pluginFile: string) {
    const pluginPath = path.dirname(pluginFile);
    const pluginFileContent = fs.readFileSync(pluginFile).toString();
    const name = path.basename(pluginPath);
    const format = pluginFile.endsWith('.yaml') || pluginFile.endsWith('.yml') ? 'yaml' : 'json';

    console.log(`Importing plugin ${name}`);

    try {
      let config: PluginImport =
        format === 'yaml'
          ? parseYaml(pluginFileContent)
          : JSON.parse(pluginFileContent);

      const { resolve, interactions } = PluginImportSchema.parse(config) as PluginImport;

      console.log('Installing dependencies');
      execSync('npm i', { cwd: pluginPath, stdio: 'inherit' });

      console.log('Building');
      execSync('npm run build', { cwd: pluginPath, stdio: 'inherit' });

      this.plugins.push({ name, resolve, pluginPath, interactions })

    } catch (e) {
      console.error(e);
    }
  }

  private applyPlugin(callisto: Callisto, { name, resolve, pluginPath, interactions }: PluginRef) {
    callisto.applyPlugin(ctx => {
      const process = forkProcess?.(resolve, pluginPath);

      this.addPluginInteractions(process!, ctx, interactions, pluginPath);
    });
  }

  private addPluginInteractions(
    process: ChildProcess,
    ctx: CallistoContext,
    interactions: PluginInteraction[],
    basePath: string,
  ) {
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
}
