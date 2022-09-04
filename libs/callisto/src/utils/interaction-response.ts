import { InteractionResponse } from "../models/callisto.models";

export const fleshOutInteractionResponse = (response: InteractionResponse | string): InteractionResponse => {
  if (typeof response === 'string') {
    return { responseText: response };
  }

  return response;
}
