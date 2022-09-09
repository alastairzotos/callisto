import { Callisto, CallistoResponse } from '@bitmetro/callisto';
import * as ws from 'ws';
import * as express from 'express';
import * as cors from 'cors';
import * as chalk from 'chalk';

import { Logger } from './logger';
import { PluginManager } from './plugin-manager';
import { Instance } from './models';

export class CallistoServer {
  private wss: ws.WebSocketServer | undefined;
  private logger = new Logger();
  private instances: { [key: string]: Instance } = {};
  private pluginManager = new PluginManager(this.logger, this.instances);

  constructor(
    private readonly options: {
      pluginsRoot: string
    }
  ) {
    this.pluginManager.setPluginsDir(options.pluginsRoot);
  }

  start(port = 8080) {
    this.pluginManager.importPlugins();

    const app = express();

    app.use(cors());

    app.get('/health', (_, res) => res.send('healthy'));

    this.wss = new ws.WebSocketServer({ server: app.listen(port) });

    this.pluginManager.setupEndpoints(app);

    this.wss.on('connection', ws => {
      const handle = this.createHandle();
      this.logger.log(`Received connection. Setting handle to ${chalk.yellow(handle)}`, handle);

      const callisto = new Callisto();
      this.instances[handle] = {
        callisto,
        processes: {}
      };

      this.pluginManager.ws = ws;
      this.pluginManager.applyPluginsToInstance(handle);

      ws.on('message', async msg => {
        this.logger.log(`Received message: ${chalk.gray(msg)}`, handle);

        const { error, interactionResponse } = await callisto.handleInput(msg.toString());
        ws.send(JSON.stringify({
          type: 'message',
          error,
          text: interactionResponse?.responseText,
          prompts: callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
        } as CallistoResponse));
      })

      ws.on('close', () => {
        this.logger.log(`Lost connection to ${chalk.yellow(handle)}`, handle);

        this.logger.log(`Killing processes ${Object.values(this.instances[handle].processes).map(p => chalk.gray(p?.pid)).join(', ')}`, handle);

        Object.values(this.instances[handle].processes)
          .forEach(process => process?.kill());

        delete this.instances[handle];
      })

      ws.send(JSON.stringify({
        type: 'prompts',
        error: false,
        prompts: callisto.getContextChain().map(ctx => ctx.getPrompts()).flat(),
      } as CallistoResponse))
    })

    this.logger.log(`Callisto server running on ${chalk.gray(`ws://localhost:${port}`)}`);
  }

  private createHandle() {
    const createRandomNumber = () => `${ Math.round(Math.random() * 99999) + 1 }`;

    let handle = createRandomNumber();
    while (!!this.instances[handle]) {
      handle = createRandomNumber();
    }

    return handle;
  }
}
