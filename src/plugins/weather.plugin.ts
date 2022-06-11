import { weatherIntegration } from "../integrations/weather.integration"
import { CallistoPlugin } from "../models/service.models"
import { ask } from "../utils/ask";

export const weatherPlugin: CallistoPlugin = ctx => {
  ctx
    .addInteraction("forget my location", async () => {
      weatherIntegration.forgetLocation();
      return 'Forgot location';
    })

    .addInteraction("what's the weather like( today| tomorrow)?", async ([time = 'today']) => {
      if (!!weatherIntegration.savedLocation()) {
        return await weatherIntegration.getWeather(time)
      } else {
        return ask(ctx, "Where do you live?", async location => await weatherIntegration.getWeather(time, location))
      }
    })
}
