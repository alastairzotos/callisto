import * as chalk from 'chalk';
import { CallistoClient } from '@bitmetro/callisto-client';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q: string) => new Promise<string>(resolve => rl.question(q, resolve))

const client = new CallistoClient({ retryTimeout: 3000 });

const query = async () => client.sendTranscript(await question(`[${chalk.yellow('You')}]: `))

client.onConnected.attach(() => {
  console.log(chalk.green('Connected to Callisto server'));
  query();
})

client.onMessage.attach(({ error, text }) => {
  console.log(`[${chalk.blueBright('Callisto')}]: ${chalk.gray(text)}`);
  query();
})

client.onClose.attach(() => console.log(chalk.red('Connection lost. Retrying...')));

client.connect();
