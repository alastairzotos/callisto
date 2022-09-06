import { config } from 'dotenv';
config();

export const env = {
  production: true, //process.env.PRODUCTION,
  weatherApiKey: 'b445b81ce6dc4bf09ff215438221006', //process.env.WEATHER_API_KEY,
};
