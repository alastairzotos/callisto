import { CallistoService } from '@bitmetro/callisto';
import { forkProcess } from '@bitmetro/callisto-ipc';
import * as path from 'path';
import * as fs from 'fs';

import { CliInputAdapter, CliOutputAdapter } from './adapters';

const pluginsRoot = path.resolve(__dirname, '..', 'plugins');

const callisto = new CallistoService();
callisto.setChildProcessHandler(forkProcess);

const importPlugin = (pluginFile: string) => {
  const pluginPath = path.dirname(pluginFile);
  const pluginFileContent = fs.readFileSync(pluginFile).toString();

  callisto.importPlugin(pluginFileContent, pluginPath, pluginFile.endsWith('.yaml') || pluginFile.endsWith('.yml') ? 'yaml' : 'json');
}

fs.readdirSync(pluginsRoot)
  .map(pluginName => path.resolve(pluginsRoot, pluginName, 'plugin.yaml'))
  .forEach(importPlugin);

callisto.registerOutputAdapter(new CliOutputAdapter());

const inputAdapter = new CliInputAdapter();
callisto.registerInputAdapter(inputAdapter);

inputAdapter.start();
