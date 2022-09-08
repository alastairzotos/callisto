import * as chalk from 'chalk';

export class Logger {
  log(msg: string, handle?: string | number) {
    if (!!handle) {
      console.log(`${chalk.gray((new Date()).toISOString())} [${chalk.blueBright('DEBUG')}][${chalk.yellow(handle)}] ${chalk.rgb(200, 200, 200)(msg)}`);
    } else {
      console.log(`${chalk.gray((new Date()).toISOString())} [${chalk.blueBright('DEBUG')}] ${chalk.rgb(200, 200, 200)(msg)}`);
    }
  }
}
