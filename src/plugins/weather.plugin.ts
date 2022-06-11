import { CallistoContext } from "../contexts/context";
import { weatherIntegration } from "../integrations/weather.integration"
import { CallistoPlugin } from "../models/service.models"

const getWeatherLocationContext = (coreContext: CallistoContext, time: string) =>
  new CallistoContext(coreContext)
    .addInteraction("(.*)", async ([location]) => {
      return {
        responseText: await weatherIntegration.getWeather(time, location),
        break: true,
      }
    });

export const weatherPlugin: CallistoPlugin = rootContext => {
  rootContext
    .addInteraction("forget my location", async () => {
      weatherIntegration.forgetLocation();

      return { responseText: 'Forgot location' };
    })

    .addInteraction("what's the weather like( today| tomorrow)?", async ([time = 'today']) => {
      if (!!weatherIntegration.savedLocation()) {
        return {
          responseText: await weatherIntegration.getWeather(time)
        }
      } else {
        return {
          responseText: 'Where do you live?',
          context: getWeatherLocationContext(rootContext, time)
        }
      }
    })
}
