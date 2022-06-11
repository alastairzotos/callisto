import { CallistoContext } from "../contexts/context"
import { InteractionResponse } from "../models/context.models"

export const ask = (ctx: CallistoContext, question: string, onResponse: (response: string) => Promise<InteractionResponse>): InteractionResponse => {
  return {
    responseText: question,
    context: ctx.addInteraction('(.*)', async ([response]) => await onResponse(response)),
  }
}
