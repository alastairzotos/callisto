import { Callisto } from '@bitmetro/callisto-core';
import * as ws from 'ws';
import * as express from 'express';
import * as cors from 'cors';
import * as chalk from 'chalk';

import { Logger } from './logger';
import { PluginManager } from './plugin-manager';
import { InstanceManager } from './instance-manager';
import { Container } from './container';
import { WebSocketHandler } from './ws-handler';
import { ManifestManager } from './manifest';
import { DownloadRejectionReason, UninstallRejectionReason } from './models';

interface ServerOptions {
  pluginsRoot: string;
}

export class CallistoServer {
  private wss: ws.WebSocketServer | undefined;

  private logger = Container.resolve(Logger);
  private pluginManager = Container.resolve(PluginManager);
  private instanceManager = Container.resolve(InstanceManager);
  private manifestManager = Container.resolve(ManifestManager);

  constructor(options: ServerOptions) {
    this.pluginManager.setPluginsDir(options.pluginsRoot);
    this.manifestManager.setPluginsDir(options.pluginsRoot);
  }

  start(port = 8080) {
    this.pluginManager.importPlugins();

    this.wss = new ws.WebSocketServer({ server: this.createExpressServer().listen(port) });

    this.wss.on('connection', ws => {
      const callisto = new Callisto();
      const wsHandler = new WebSocketHandler(ws);

      const handle = this.instanceManager.add(callisto, wsHandler);

      this.logger.log(`Received connection. Setting handle to ${chalk.yellow(handle)}`, handle);

      this.pluginManager.applyAllPluginsToInstance(handle);

      wsHandler.setupListeners(handle);

      this.pluginManager.sendPrompts(handle);
    })

    this.logger.log(`Callisto server running on ${chalk.gray(`ws://localhost:${port}`)}`);
  }

  createExpressServer() {
    const app = express();

    app.use(cors());

    app.get('/health', (_, res) => res.send('healthy'));

    app.get('/plugins', (_, res) => {
      res.json(this.manifestManager.readManifest());
    });

    app.get('/prune', async (_, res) => {
      await this.pluginManager.prunePlugins();

      res.send('System pruned');
    })

    app.get('/plugin/install', async (req, res) => {
      try {
        await this.pluginManager.downloadPlugin(req.query.url as string);

        res.send('Downloaded ' + req.query.url);
      } catch (e) {
        const reason = e as DownloadRejectionReason;
        if (reason === 'not-found') {
          res.status(404).send(`Cannot file file "${req.query.url}"`);
        } else if (reason === 'bad-format') {
          res.status(400).send(`Invalid filename format. Must be "[name]-[major].[minor].[patch].zip"`)
        } else {
          res.sendStatus(500);
        }
      }
    })

    app.get('/plugin/uninstall', async (req, res) => {
      try {
        await this.pluginManager.uninstallPlugin(req.query.name as string);

        res.send('Uninstalled ' + req.query.name);
      } catch (e) {
        const reason = e as UninstallRejectionReason;

        if (reason === 'no-plugin') {
          res.status(404).send(`No plugin named ${req.query.name} is installed`)
        }
      }
    });

    return app;
  }
}
