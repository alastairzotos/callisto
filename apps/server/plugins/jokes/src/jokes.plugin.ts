import { onInteraction } from '@bitmetro/callisto-plugins';
import fetch from 'node-fetch';

export const getJoke = async (): Promise<string> => {
  try {
    const res = await fetch("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json"
      }
    });

    const data = await res.json();

    return data.joke;
  } catch {
    return 'There was an error getting a joke';
  }
}

onInteraction('joke', getJoke);
onInteraction('continue', getJoke);
