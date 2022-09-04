import { CallistoService, CallistoInputAdapter, CallistoOutputAdapter, InteractionResponse } from '@bitmetro/callisto';
import { jokesPlugin } from './plugins/jokes.plugin';
import { weatherPlugin } from './plugins/weather.plugin';
import { wikipediaPlugin } from './plugins/wikipedia.plugin';

import { question } from 'readline-sync';

class CliOutputAdapter extends CallistoOutputAdapter {
  async handleMatchingInteractionFound(found: boolean) {
    if (!found) {
      console.log('[CALLISTO]:', this.noMatchResponse);
    }
  }

  async handleResponse(response: InteractionResponse): Promise<void> {
    console.log('[CALLISTO]:', response.responseText);
  }
}

class CliInputAdapter extends CallistoInputAdapter {
  async start() {
    while (true) {
      await this.handleInput(question('> '))
    }
  }
}

const callisto = new CallistoService();
callisto.applyPlugins(weatherPlugin, wikipediaPlugin, jokesPlugin);

callisto.registerOutputAdapter(new CliOutputAdapter());

const inputAdapter = new CliInputAdapter();
callisto.registerInputAdapter(inputAdapter);
inputAdapter.start();
