import { weatherIntegration } from "../integrations/weather.integration"
import { CallistoPlugin, ask } from '@bitmetro/callisto';

export const weatherPlugin: CallistoPlugin = ctx => {
  ctx

    .addInteraction("what's the weather like( today| tomorrow)? in (.+)", async ([time = 'today', location]) => {
      return await weatherIntegration.getWeatherInTimeAndLocation(time, location);
    })

    .addInteraction("what's the weather like( today| tomorrow)?", async ([time = 'today']) => {
      return ask(ctx, "Where do you live?", async location => {
        return await weatherIntegration.getWeatherInTimeAndLocation(time, location);
      })
    })

  return {
    prompts: ['Try asking about the weather', 'Try asking for the weather in Beijing']
  }
}
