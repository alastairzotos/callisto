import { weatherIntegration } from "../integrations/weather.integration";
import { CallistoContext } from "./context";

export const getWeatherLocationContext = (coreContext: CallistoContext, time: string) =>
  new CallistoContext(coreContext)
    .addInteraction("(.*)", async ([location]) => {
      return {
        responseText: await weatherIntegration.getWeather(time, location),
        break: true,
      }
    });
