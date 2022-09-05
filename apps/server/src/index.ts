import { CallistoService } from '@bitmetro/callisto';
import { forkProcess } from '@bitmetro/callisto-ipc';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

const pluginsRoot = path.resolve(__dirname, '..', 'plugins');

const callisto = new CallistoService();
callisto.setForkProcessHandler(forkProcess);

const importPlugin = (pluginFile: string) => {
  const pluginPath = path.dirname(pluginFile);
  const pluginFileContent = fs.readFileSync(pluginFile).toString();

  callisto.importPlugin(pluginFileContent, pluginPath, pluginFile.endsWith('.yaml') || pluginFile.endsWith('.yml') ? 'yaml' : 'json');
}

fs.readdirSync(pluginsRoot)
  .map(pluginName => path.resolve(pluginsRoot, pluginName, 'plugin.yaml'))
  .forEach(importPlugin);

const app = express();

app.get('/query/:q', async (req, res) => {
  const { error, interactionResponse } = await callisto.handleInput(req.params.q);
  
  res.send({ error, responseText: interactionResponse?.responseText });
});

app.listen(3001, () => console.log('Listening on http://localhost:3001'));
