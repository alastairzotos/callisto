import { onReceiveArgs, sendResponse } from '@bitmetro/callisto-ipc';
import { getSummary } from './get-summary';

onReceiveArgs<{ topic?: string; sentenceIndex?: number }>(async (_, data) => {
  const { topic, sentenceIndex } = data;
  const sentences = await getSummary(topic);

  if (sentenceIndex >= sentences.length - 1) {
    return sendResponse(`That's all I have on ${topic}`, { topic, sentenceIndex });
  }

  sendResponse(sentences[sentenceIndex], { topic, sentenceIndex: sentenceIndex + 1 });
})