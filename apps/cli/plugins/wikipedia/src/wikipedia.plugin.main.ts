import { getCallistoArgs, sendCallistoResponse } from '@bitmetro/callisto-ipc';
import { getSummary } from './get-summary';

const start = async () => {
  const { argv } = getCallistoArgs<{ topic?: string; sentenceIndex?: number }>();
  const topic = argv[0];

  const sentences = await getSummary(topic);

  sendCallistoResponse(sentences[0], { topic, sentenceIndex: 1 });
}

start();
