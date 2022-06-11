import { weatherIntegration } from "../integrations/weather.integration"
import { wikipediaIntegration } from "../integrations/wikipedia.intergration"
import { CallistoContext } from "./context"
import { getWeatherLocationContext } from "./weather-location.context"

export const coreContext = new CallistoContext()

coreContext
  .addInteraction("forget me", async () => {
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
        context: getWeatherLocationContext(coreContext, time)
      }
    }
  })

  .addInteraction("tell me about (.+)", async ([topic]) => {
    return {
      responseText: await wikipediaIntegration.getSummary(topic)
    }
  })

  .addInteraction("tell (.+) to go f\\*\\*\\* himself", async ([name]) => {
    return {
      responseText: `Go fuck yourself ${name}`
    }
  })