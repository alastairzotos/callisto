import fetch from 'node-fetch';
import { question } from 'readline-sync';

const start = async () => {
  while (true) {
    const input = question('> ');

    const res = await fetch(`http://localhost:3001/query/${encodeURIComponent(input)}`);
    const { error, responseText } = await res.json() as  { error: boolean, responseText: string };

    if (error) {
      console.log(`> [CALLISTO]: Sorry, I don't understand`)
    } else {
      console.log(`> [CALLISTO]: ${responseText}`);
    }
  }
}

start();
