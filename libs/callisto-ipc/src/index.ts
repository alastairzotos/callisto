import { fork } from 'child_process';
import { CallistoPluginResponse, ChildProcessHandler } from '@bitmetro/callisto';

export interface CallistoPluginArgs<T> {
  data?: T;
  argv: (string | undefined)[];
}

export const getCallistoArgs = <T = any>(): CallistoPluginArgs<T> => {
  const argv = process.argv.slice(2);
  const contextDataArg = argv.pop();

  return {
    data: JSON.parse(Buffer.from(contextDataArg || '{}', 'base64').toString()) as T,
    argv: argv.map(argv => argv === 'undefined' ? undefined : argv)
  }
}

export const sendCallistoResponse = (response: string, data: any = {}) => {
  process.send?.({ response, data });
  process.exit(0);
}

export const forkProcess: ChildProcessHandler = (cmd: string, args: string[], cwd: string): Promise<CallistoPluginResponse> =>
  new Promise((resolve, reject) => {
    const proc = fork(cmd, args, { cwd })
    
    proc
      .on('message', (data: CallistoPluginResponse) => resolve(data))
      .on('error', () => reject)
      .on('exit', () => resolve({ response: 'No response', data: null }))
  })
