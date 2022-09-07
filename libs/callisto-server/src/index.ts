import { ask, Callisto, CallistoContext, CallistoResponse } from '@bitmetro/callisto';
import * as path from 'path';
import * as fs from 'fs';
import * as ws from 'ws';
import { parse as parseYaml } from 'yaml';
import { execSync, fork, ChildProcess } from 'child_process';
import * as express from 'express';
import * as chalk from 'chalk';

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

    const app = express();

    app.get('/health', (_, res) => res.send('healthy'));

    this.wss = new ws.WebSocketServer({ server: app.listen(port) });

    this.wss.on('connection', ws => {
      const handle = this.createHandle();
      this.debug(`Received connection. Setting handle to ${chalk.yellow(handle)}`, handle);

      const callisto = new Callisto();
      const processes = this.plugins.map(plugin => this.applyPlugin(callisto, handle, plugin));

      this.debug(`Created processes ${processes.map(p => chalk.gray(p.pid)).join(', ')}`, handle);

      ws.on('message', async msg => {
        this.debug(`Received message: ${chalk.gray(msg)}`, handle);

        const { error, interactionResponse } = await callisto.handleInput(msg.toString());
        ws.send(JSON.stringify({
          type: 'message',
          error,
          text: interactionResponse?.responseText,
          prompts: callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
        } as CallistoResponse));
      })

      ws.on('close', () => {
        this.debug(`Lost connection to ${chalk.yellow(handle)}`, handle);

        this.debug(`Killing processes ${processes.map(p => chalk.gray(p.pid)).join(', ')}`, handle);

        processes.forEach(process => process.kill());
      })

      ws.send(JSON.stringify({
        type: 'prompts',
        error: false,
        prompts: callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
      } as CallistoResponse))
    })

    this.debug(`Callisto server running on ${chalk.gray(`ws://localhost:${port}`)}`);
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

    this.debug(`Importing plugin ${chalk.yellow(name)}`, name);

    try {
      let config: PluginImport =
        format === 'yaml'
          ? parseYaml(pluginFileContent)
          : JSON.parse(pluginFileContent);

      const { resolve, interactions } = PluginImportSchema.parse(config) as PluginImport;

      this.debug('Installing dependencies', name);
      execSync('npm i', { cwd: pluginPath, stdio: 'inherit' });

      this.debug('Building', name);
      execSync('npm run build', { cwd: pluginPath, stdio: 'inherit' });

      this.plugins.push({ name, resolve, pluginPath, interactions })

    } catch (e) {
      console.error(e);
    }
  }

  private applyPlugin(callisto: Callisto, handle, { resolve, pluginPath, interactions }: PluginRef) {
    const process = fork(resolve, { cwd: pluginPath });

    this.addPluginInteractions(process!, callisto.getRootContext(), interactions, pluginPath);

    return process;
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

  private createHandle() {
    return Math.round(Math.random() * 9999) + 1;
  }

  private debug(msg: string, handle?: string | number) {
    if (!!handle) {
      console.log(`${chalk.gray((new Date()).toISOString())} [${chalk.blueBright('DEBUG')}][${chalk.yellow(handle)}] ${chalk.rgb(200, 200, 200)(msg)}`);
    } else {
      console.log(`${chalk.gray((new Date()).toISOString())} [${chalk.blueBright('DEBUG')}] ${chalk.rgb(200, 200, 200)(msg)}`);
    }
  }
}
