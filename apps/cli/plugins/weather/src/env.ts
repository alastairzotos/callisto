import { config } from 'dotenv';
config();

export const env = {
  production: process.env.PRODUCTION,
  weatherApiKey: process.env.WEATHER_API_KEY,
};
