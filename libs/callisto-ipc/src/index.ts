import { fork } from 'child_process';
import { CallistoPluginResponse, ForkProcess } from '@bitmetro/callisto';

export interface CallistoPluginInput<T> {
  type: 'cmd' | 'answer';
  data?: T;
  args: (string | undefined)[];
}

let currentCallback: ((message: string) => void | undefined);

export const onReceiveArgs = <T = any>(cb: (args: (string | undefined)[], data?: T) => void) => {
  const handler = message => currentCallback?.(message);

  currentCallback = (message: string) => {
    const { args, data } = JSON.parse(message) as CallistoPluginInput<T>
    cb(args.map(arg => arg === null ? undefined : arg), data)
  };

  process.on('message', handler)
}

export const sendQuestion = (question: string, cb: (answer: string) => void) => {
  currentCallback = cb;
  process.send?.({ type: 'question', response: question } as CallistoPluginResponse);
}

export const sendResponse = (response: string, data: any = {}) => {
  process.send?.({ type: 'response', response, data } as CallistoPluginResponse);
}

export const forkProcess: ForkProcess = (cmd: string, args: string[], cwd: string) => fork(cmd, args, { cwd })

