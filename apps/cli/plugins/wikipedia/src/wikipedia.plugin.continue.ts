import { getCallistoArgs, sendCallistoResponse } from '@bitmetro/callisto-ipc';
import { getSummary } from './get-summary';

const start = async () => {
  const { data: { topic, sentenceIndex } } = getCallistoArgs<{ topic?: string; sentenceIndex?: number }>();

  const sentences = await getSummary(topic);

  if (sentenceIndex >= sentences.length - 1) {
    return sendCallistoResponse(`That's all I have on ${topic}`, { topic, sentenceIndex });
  }

  sendCallistoResponse(sentences[sentenceIndex], { topic, sentenceIndex: sentenceIndex + 1 });
}

start();
