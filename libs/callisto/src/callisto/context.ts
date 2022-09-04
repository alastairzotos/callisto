import { Interaction, InteractionHandler, InteractionHandlerResponse } from "../models/callisto.models";
import { simplifyInteractionResponse } from "../utils/interaction-response";

export class CallistoContext {
  private interactions: Interaction[] = [];

  constructor(public parent?: CallistoContext) {}

  async handleInput(input: string): Promise<InteractionHandlerResponse> {
    const interaction = this.interactions.find(interaction => interaction.regex.test(input));
    
    if (interaction) {
      const match = interaction.regex.exec(input);
      
      if (match) {
        const interactionResponse = simplifyInteractionResponse(
          await interaction.handler([...match?.slice(1).map(i => i ? i.trim().toLocaleLowerCase() : i)])
        );

        return {
          error: false,
          matchingContext: interactionResponse.context || this,
          interactionResponse
        }
      }
    }

    if (this.parent) {
      return this.parent.handleInput(input);
    }

    return { error: true }
  }

  addInteraction(regex: string | string[], handler: InteractionHandler) {
    if (typeof regex === 'string') {
      this.interactions.push({
        regex: new RegExp(`^${regex}$`, 'i'),
        handler
      });
    } else {
      regex.forEach(r => this.addInteraction(r, handler));
    }

    return this;
  }

  addInteractions(interactions: { [regex: string]: InteractionHandler }) {
    Object.keys(interactions).forEach(regex => this.addInteraction(regex, interactions[regex]));

    return this;
  }
}
