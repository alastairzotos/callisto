import { onReceiveArgs, sendResponse } from '@bitmetro/callisto-ipc';
import { getSummary } from './get-summary';

onReceiveArgs(async ([topic], data) => {
  const sentences = await getSummary(topic);

  sendResponse(sentences[0], { topic, sentenceIndex: 1 });
})