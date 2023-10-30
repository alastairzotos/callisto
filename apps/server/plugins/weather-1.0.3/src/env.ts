import { config } from 'dotenv';
config();

export const env = {
  production: !process.env.DEV,
  weatherApiKey: process.env.WEATHER_API_KEY,
};
