import { wikipediaIntegration } from "../integrations/wikipedia.intergration"
import { CallistoPlugin } from "../models/service.models"

export const wikipediaPlugin: CallistoPlugin = ctx => {
  ctx.addInteraction("tell me about (.+)", async ([topic]) => await wikipediaIntegration.getSummary(topic))
}
