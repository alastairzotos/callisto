import { onInteraction } from '@bitmetro/callisto-plugins';
import { getSummary } from './get-summary';

let topic = '';
let sentences: string[] = [];
let sentenceIndex = 0;

onInteraction('query', async (query) => {
  sentenceIndex = 0;
  topic = query!;
  sentences = await getSummary(topic);

  return sentences[0];
})

onInteraction('continue', () => {
  if (sentenceIndex >= sentences.length - 1) {
    return `That's all I have on ${topic}`;
  }

  return sentences[++sentenceIndex];
})