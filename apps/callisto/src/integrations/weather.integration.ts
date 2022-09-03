import { env } from "../../env";

const LOCATION_KEY = 'callisto:location';

export class WeatherIntegration {
  savedLocation() {
    return localStorage.getItem(LOCATION_KEY);
  }

  saveLocation(location: string) {
    localStorage.setItem(LOCATION_KEY, location);
  }

  forgetLocation() {
    localStorage.removeItem(LOCATION_KEY);
  }

  async getWeather(time: string): Promise<string> {
    return this.getWeatherInTimeAndLocation(time, this.savedLocation()!);
  }

  async getWeatherInTimeAndLocation(time: string, location: string): Promise<string> {
    const uri = this.generateUri(time, location);

    if (!uri) {
      return 'Invalid time or location'
    }

    const res = await fetch(uri);
    const data = await res.json();

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
