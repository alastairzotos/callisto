import { Callisto } from "@bitmetro/callisto-core";
import { ChildProcess } from 'child_process';

import { Container } from "./container";
import { Logger } from "./logger";
import { Instance } from "./models";
import { createRandomNumber } from "./utils";
import { WebSocketHandler } from "./ws-handler";

export class InstanceManager {
  private logger = Container.resolve(Logger);

  private instances: { [key: string]: Instance } = {};

  get(handle: string) {
    return this.instances[handle];
  }

  add(callisto: Callisto, ws: WebSocketHandler) {
    const handle = this.createHandle();

    this.instances[handle] = {
      callisto,
      ws,
      processes: {}
    }

    return handle;
  }

  forEach(cb: (handle: string, instance: Instance) => void) {
    Object.keys(this.instances).forEach(handle => cb(handle, this.instances[handle]));
  }

  mapProcesses(handle: string, cb: (name: string, process: ChildProcess | undefined, pid: number | undefined) => void) {
    const instance = this.instances[handle];

    return Object.keys(instance.processes).map(key => cb(key, instance.processes[key], instance.processes[key]?.pid));
  }

  kill(handle: string) {
    Object.values(this.instances[handle].processes)
      .forEach(process => process?.kill());

    delete this.instances[handle];
  }

  killProcess(handle: string, pluginName: string) {
    const staleProcess = this.instances[handle].processes[pluginName];

    if (staleProcess) {
      const pid = staleProcess.pid;

      staleProcess.kill();

      this.get(handle).callisto.getRootContext().removeInteractions(pluginName);
      delete this.instances[handle].processes[pluginName];

      return pid;
    }
  }

  killProcesses(plugins: string[]) {
    const killedProcessIds: number[] = [];

    this.forEach(handle => {
      for (let plugin of plugins) {
        const killedProcessId = this.killProcess(handle, plugin);
        if (!!killedProcessId) {
          killedProcessIds.push(killedProcessId);
        }
      }
    })

    return killedProcessIds;
  }

  restart(plugin: string) {
    this.forEach((handle, instance) => {
      this.killProcess(handle, plugin);

    })
  }

  private createHandle() {
    let handle = createRandomNumber(1, 100000);
    while (!!this.instances[handle]) {
      handle = createRandomNumber(1, 100000);
    }

    return handle;
  }
}
