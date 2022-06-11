import { CallistoPlugin } from "../models/service.models"

export const funnyPlugin: CallistoPlugin = ctx => {
  ctx.addInteraction("tell (.+) to go f\\*\\*\\* himself", async ([name]) => `Go fuck yourself ${name}`)
}
