import { InteractionResponse } from "../models/context.models";

export const fleshOutInteractionResponse = (response: InteractionResponse | string): InteractionResponse => {
  if (typeof response === 'string') {
    return { responseText: response };
  }

  return response;
}
