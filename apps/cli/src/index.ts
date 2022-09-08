import * as chalk from 'chalk';
import { CallistoNodeClient } from '@bitmetro/callisto-client';
import * as readline from 'readline';
import { config } from 'dotenv';

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q: string) => new Promise<string>(resolve => rl.question(q, resolve))

// Create a .env file in this root of this app (apps/cli) with
// CALLISTO_SERVER_URL=ws://localhost:8080
const client = new CallistoNodeClient({ host: process.env.CALLISTO_SERVER_URL!, retryTimeout: 3000 });

const query = async () => client.sendTranscript(await question(`[${chalk.yellow('You')}]: `))

client.onConnected.attach(() => {
  console.log(chalk.green('Connected to Callisto server'));
})

client.onMessage.attach(({ type, error, text, prompts }) => {
  if (type === 'message') {
    if (error) {
      console.log(`[${chalk.blueBright('Callisto')}]: ${chalk.gray(`Sorry, I don't understand`)}`);
    } else if (text !== '') {
      console.log(`[${chalk.blueBright('Callisto')}]: ${chalk.gray(text)}`);
    }
  } else if (type === 'prompts') {
    prompts?.forEach(prompt => {
      console.log(`[${chalk.blueBright('Callisto')}]: ${chalk.gray(prompt)}`);
    })
  }
  query();
})

client.onClose.attach(() => console.log(chalk.red('Connection lost. Retrying...')));

client.connect();
