import { CallistoContext } from "../callisto/context"
import { InteractionResponse } from "../models/callisto.models"
import { fleshOutInteractionResponse } from "./interaction-response"

export const ask = (
  ctx: CallistoContext,
  question: string,
  onResponse: (response: string) => Promise<InteractionResponse | string>,
  goToParentContextOnceFinished = true,
): InteractionResponse => {
  return {
    responseText: question,
    context: ctx.addInteraction('(.*)', async ([response]) => {
      const res = fleshOutInteractionResponse(await onResponse(response));

      return {
        ...res,
        goToParentContextOnceFinished
      }
    }),
  }
}
