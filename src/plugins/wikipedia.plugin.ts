import { wikipediaIntegration } from "../integrations/wikipedia.intergration"
import { CallistoPlugin } from "../models/service.models"

export const wikipediaPlugin: CallistoPlugin = rootContext => {
  rootContext
    .addInteraction("tell me about (.+)", async ([topic]) => {
      return {
        responseText: await wikipediaIntegration.getSummary(topic)
      }
    })
}
