import { CallistoPlugin } from "../models/service.models"

export const funnyPlugin: CallistoPlugin = rootContext => {
  rootContext.addInteraction("tell (.+) to go f\\*\\*\\* himself", async ([name]) => {
    return {
      responseText: `Go fuck yourself ${name}`
    }
  })
}
