import { CallistoInputAdapter, CallistoOutputAdapter, InteractionResponse } from '@bitmetro/callisto';
import { question } from 'readline-sync';

export class CliOutputAdapter extends CallistoOutputAdapter {
  async handleMatchingInteractionFound(found: boolean) {
    if (!found) {
      console.log('> [CALLISTO]:', this.noMatchResponse);
    }
  }

  async handleResponse(response: InteractionResponse): Promise<void> {
    console.log('> [CALLISTO]:', response.responseText);
  }
}

export class CliInputAdapter extends CallistoInputAdapter {
  async start() {
    while (true) {
      await this.handleInput(question('> '))
    }
  }
}
