import fetch from 'node-fetch';
import { env } from "../env";

export class WeatherIntegration {
  async getWeatherInTimeAndLocation(time: string, location: string): Promise<string> {
    const uri = this.generateUri(time, location);

    if (!uri) {
      return 'Invalid time or location'
    }

    const res = await fetch(uri);
    const data = await res.json() as any;

    return `${time} in ${location}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
  }

  private generateUri(time: string, location: string): string | undefined {
    const protocol = env.production ? 'https' : 'http';

    if (time === 'today') {
      return `${protocol}://api.weatherapi.com/v1/current.json?key=${env.weatherApiKey}&q=${location}&aqi=no`;
    } else if (time === 'tomorrow') {
      return `${protocol}://api.weatherapi.com/v1/forecast.json?key=${env.weatherApiKey}&q=${location}&days=2&aqi=no`;
    }
  }
}

export const weatherIntegration = new WeatherIntegration();
