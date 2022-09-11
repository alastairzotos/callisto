import { CallistoPluginMessage, CallistoPluginResponse } from '@bitmetro/callisto-core';

let answerCallback: ((answer: string) => void | undefined);

type InteractionHandler = (...args: (string | undefined)[]) => string | Promise<string>;
const interactionHandlers: { [id: string]: InteractionHandler } = {};

console.log('>>>>>>> plugin thing loaded');

let pluginStarted = false;
const startPlugin = () => {
  if (!pluginStarted) {
    pluginStarted = true;

    process.on('message', async (message: string) => {
      console.log('>>>>>>>> got', message);
      const data = JSON.parse(message) as CallistoPluginMessage;
      console.log(data);
      
      if (data.type === 'input') {
        const { interactionId, args } = data;
        const response = interactionHandlers[interactionId!]?.(...args!.map(arg => arg === null ? undefined : arg))
        console.log('>>>>>>', response);
        sendResponse(typeof response === 'string' ? response : await response);
        console.log('>>>>>>> sent');
      } else if (data.type === 'answer') {
        answerCallback(data.answer!);
      }
    })
  }
}

export const onInteraction = (id: string, cb: InteractionHandler) => {
  startPlugin();
  interactionHandlers[id] = cb;
}

export const sendQuestion = (question: string, cb: (answer: string) => void) => {
  answerCallback = cb;
  process.send?.({ type: 'question', response: question } as CallistoPluginResponse);
}

export const sendResponse = (response: string) => {
  process.send?.({ type: 'response', response } as CallistoPluginResponse);
}
