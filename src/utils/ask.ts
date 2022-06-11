import { CallistoContext } from "../contexts/context"
import { InteractionResponse } from "../models/context.models"

export const ask = (
  ctx: CallistoContext,
  question: string,
  onResponse: (response: string) => Promise<InteractionResponse | string>,
  goToParentContextOnceFinished = true,
): InteractionResponse => {
  return {
    responseText: question,
    context: ctx.addInteraction('(.*)', async ([response]) => {
      const res = await onResponse(response);

      return {
        ...(typeof res === 'string' ? { responseText: res } : res),
        goToParentContextOnceFinished
      }
    }),
  }
}
