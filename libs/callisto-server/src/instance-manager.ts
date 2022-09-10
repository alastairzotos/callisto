import { Callisto } from "@bitmetro/callisto";

import { Container } from "./container";
import { Logger } from "./logger";
import { Instance } from "./models";
import { WebSocketHandler } from "./ws-handler";

export class InstanceManager {
  private logger = Container.resolve(Logger);

  private instances: { [key: string]: Instance } = {};

  get(handle: string) {
    return this.instances[handle];
  }

  forEach(cb: (handle: string, instance: Instance) => void) {
    Object.keys(this.instances).forEach(handle => cb(handle, this.instances[handle]));
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

  getProcessIds(handle: string) {
    return Object.values(this.instances[handle].processes).map(p => p?.pid);
  }

  kill(handle: string) {
    Object.values(this.instances[handle].processes)
      .forEach(process => process?.kill());

    delete this.instances[handle];
  }

  killProcess(handle: string, pluginName: string) {
    const staleProcess = this.instances[handle].processes[pluginName];

    if (staleProcess) {
      staleProcess.kill();

      const pid = this.instances[handle].processes[pluginName]?.pid;

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

  private createHandle() {
    const createRandomNumber = () => `${Math.round(Math.random() * 99999) + 1}`;

    let handle = createRandomNumber();
    while (!!this.instances[handle]) {
      handle = createRandomNumber();
    }

    return handle;
  }
}
