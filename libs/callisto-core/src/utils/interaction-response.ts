import { InteractionResponse } from "../models/callisto.models";

export const simplifyInteractionResponse = (response: InteractionResponse | string): InteractionResponse => {
  if (typeof response === 'string') {
    return { responseText: response };
  }

  return response;
}
