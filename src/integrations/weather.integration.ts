import { env } from "../env";

export class WeatherIntegration {
  savedLocation() {
    return localStorage.getItem('location');
  }

  saveLocation(location: string) {
    localStorage.setItem('location', location);
  }

  forgetLocation() {
    localStorage.removeItem('location');
  }

  async getWeather(time: string, location?: string): Promise<string> {
    if (!location) {
      location = this.savedLocation()!;
    } else {
      this.saveLocation(location);
    }
    
    const uri = this.generateUri(time, location);

    if (!uri) {
      return 'Invalid time or location'
    }

    const res = await fetch(uri);
    const data = await res.json();

    return `${time} in ${location}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
  }

  private generateUri(time: string, location: string): string | undefined {
    if (time === 'today') {
      return `http://api.weatherapi.com/v1/current.json?key=${env.weatherApiKey}&q=${location}&aqi=no`;
    } else if (time === 'tomorrow') {
      return `http://api.weatherapi.com/v1/forecast.json?key=${env.weatherApiKey}&q=${location}&days=1&aqi=no`;
    }
  }
}

export const weatherIntegration = new WeatherIntegration();
