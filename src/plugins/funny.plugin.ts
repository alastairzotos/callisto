import { CallistoPlugin } from "../models/service.models"

export const funnyPlugin: CallistoPlugin = ctx => {
  ctx.addInteraction("tell (.+) to go f\\*\\*\\* (himself|herself|themselves)", async ([name]) => `Go fuck yourself ${name}`)
}
