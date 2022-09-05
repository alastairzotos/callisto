import { ChildProcess } from "../models/callisto.models";
import { CallistoPluginResponse } from "./models";

export const sendMessage = (process: ChildProcess, message: string) =>
  new Promise<CallistoPluginResponse>((resolve, reject) => {
    process
      .on('message', (data: CallistoPluginResponse) => resolve(data))
      .on('error', () => reject)
      .on('exit', () => resolve({ type: 'response', response: 'No response', data: null }))

    process.send(message);
  })
