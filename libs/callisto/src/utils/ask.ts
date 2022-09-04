import { InteractionResponse } from "../models/callisto.models";
import { CallistoContext } from "../callisto/context"
import { simplifyInteractionResponse } from "./interaction-response"

export const ask = (
  ctx: CallistoContext,
  question: string,
  onResponse: (response: string) => Promise<InteractionResponse | string>,
  goToParentContextOnceFinished = true,
): InteractionResponse => {
  return {
    responseText: question,
    context: ctx.addInteraction('(.*)', async ([response]) => {
      const res = simplifyInteractionResponse(await onResponse(response));

      return {
        ...res,
        goToParentContextOnceFinished
      }
    }),
  }
}
