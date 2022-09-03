import { CallistoPlugin } from '@bitmetro/callisto'

export const funnyPlugin: CallistoPlugin = ctx => {
  ctx
    .addInteraction("tell (.+) to go f\\*\\*\\* (himself|herself|themselves)", async ([name]) => `Go fuck yourself ${name}`)
    .addInteraction("tell (.+) to f\\*\\*\\* off", async ([name]) => `Go fuck yourself ${name}`)
  
  return {
    prompts: ['Did you know I can tell people to go f*** themselves?']
  }
}
