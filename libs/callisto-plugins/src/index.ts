import { CallistoPluginMessage, CallistoPluginResponse } from '@bitmetro/callisto-core';

let answerCallback: ((answer: string) => void | undefined);

type InteractionHandler = (...args: (string | undefined)[]) => string | Promise<string>;
const interactionHandlers: { [id: string]: InteractionHandler } = {};

let pluginStarted = false;
const startPlugin = () => {
  if (!pluginStarted) {
    pluginStarted = true;

    process.on('message', async (message: string) => {
      const data = JSON.parse(message) as CallistoPluginMessage;
      
      if (data.type === 'input') {
        const { interactionId, args } = data;
        const response = interactionHandlers[interactionId!]?.(...args!.map(arg => arg === null ? undefined : arg))
        sendResponse(typeof response === 'string' ? response : await response);
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

export const askQuestion = (question: string) => new Promise<string>((resolve) => {
  answerCallback = resolve;
  process.send?.({ type: 'question', response: question } as CallistoPluginResponse);
})
