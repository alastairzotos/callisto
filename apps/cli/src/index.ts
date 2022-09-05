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

importPlugin(path.resolve(pluginsRoot, 'wikipedia', 'wikipedia.plugin.yaml'))
importPlugin(path.resolve(pluginsRoot, 'jokes', 'jokes.plugin.yaml'))
importPlugin(path.resolve(pluginsRoot, 'weather', 'weather.plugin.yaml'))

callisto.registerOutputAdapter(new CliOutputAdapter());

const inputAdapter = new CliInputAdapter();
callisto.registerInputAdapter(inputAdapter);

inputAdapter.start();
