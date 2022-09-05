import { CallistoPluginMessage, CallistoPluginResponse } from "./models";

export interface ChildProcess {
  send: (message: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => ChildProcess;
}

export type ForkProcess = (cmd: string, cwd: string) => ChildProcess;

export const sendMessage = (process: ChildProcess, message: string) =>
  new Promise<CallistoPluginResponse>((resolve, reject) => {
    process
      .on('message', (data: CallistoPluginResponse) => resolve(data))
      .on('error', () => reject)
      .on('exit', () => resolve({ type: 'response', response: 'No response' }))

    process.send(message);
  })

export const sendCommand = async (process: ChildProcess, interactionId: string, args: string[]) =>
  await sendMessage(process, JSON.stringify({ type: 'cmd', interactionId, args } as CallistoPluginMessage))

export const sendAnswer = async (process: ChildProcess, answer: string) =>
  await sendMessage(process, JSON.stringify({ type: 'answer', answer } as CallistoPluginMessage));
