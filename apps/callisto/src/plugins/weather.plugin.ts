import { weatherIntegration } from "../integrations/weather.integration"
import { CallistoPlugin, ask } from '@bitmetro/callisto';

export const weatherPlugin: CallistoPlugin = ctx => {
  ctx
    .addPrompts(['Try asking about the weather', 'Try asking for the weather in Beijing', 'Ask for the weather in New York'])
    .addInteraction("forget my location", async () => {
      weatherIntegration.forgetLocation();
      return 'Forgot location';
    })

    .addInteraction("what's the weather like( today| tomorrow)? in (.+)", async ([time = 'today', location]) => {
      return await weatherIntegration.getWeatherInTimeAndLocation(time, location);
    })

    .addInteraction("what's the weather like( today| tomorrow)?", async ([time = 'today']) => {
      if (weatherIntegration.savedLocation()) {
        return await weatherIntegration.getWeather(time)
      } else {
        return ask(ctx, "Where do you live?", async location => {
          weatherIntegration.saveLocation(location);
          return await weatherIntegration.getWeather(time);
        })
      }
    })
}
