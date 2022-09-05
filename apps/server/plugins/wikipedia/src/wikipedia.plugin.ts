import { onInteraction } from '@bitmetro/callisto-ipc';
import { getSummary } from './get-summary';

let topic = '';
let sentences: string[] = [];
let sentenceIndex = 0;

onInteraction('query', async (args) => {
  sentenceIndex = 0;
  topic = args[0];
  sentences = await getSummary(topic);

  return sentences[0];
})

onInteraction('continue', () => {
  if (sentenceIndex >= sentences.length - 1) {
    return `That's all I have on ${topic}`;
  }

  return sentences[++sentenceIndex];
})
