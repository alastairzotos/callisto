import { CallistoService } from '@bitmetro/callisto';
import { forkProcess } from '@bitmetro/callisto-ipc';
import * as path from 'path';
import * as fs from 'fs';
import { question } from 'readline-sync';

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


callisto.addEventHandlers({
  onResponse: async ({ error, interactionResponse }) => {
    if (error) {
      console.log(`> [CALLISTO]: Sorry, I don't understand`)
    } else if (interactionResponse) {
      console.log(`> [CALLISTO]: ${interactionResponse.responseText}`);
    }
  }
})

const start = async () => {
  while (true) {
    await callisto.handleInput(question('> '))
  }
}

start();
