import { env } from './env';
import fetch from 'node-fetch';

const upperCaseWord = (word: string) => word.length === 0 ? '' : word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();

export const getWeather = async (time: string, location: string): Promise<string> => {
  const uri = generateUri(time, location);

    if (!uri) {
      return 'Invalid time or location'
    }

    const res = await fetch(uri);
    const data = await res.json();

    return `${upperCaseWord(time)} in ${upperCaseWord(location)}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
}

const generateUri = (time: string, location: string): string | undefined => {
  const protocol = env.production ? 'https' : 'http';

  if (time === 'today') {
    return `${protocol}://api.weatherapi.com/v1/current.json?key=${env.weatherApiKey}&q=${location}&aqi=no`;
  } else if (time === 'tomorrow') {
    return `${protocol}://api.weatherapi.com/v1/forecast.json?key=${env.weatherApiKey}&q=${location}&days=2&aqi=no`;
  }
}
