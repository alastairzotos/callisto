import { Interaction, InteractionHandler, InteractionHandlerResponse } from "../models/context.models";
import { fleshOutInteractionResponse } from "../utils/interaction-response";

export class CallistoContext {
  private interactions: Interaction[] = [];

  constructor(public parent?: CallistoContext) {}

  async handleTranscript(transcript: string): Promise<InteractionHandlerResponse> {
    const interaction = this.interactions.find(interaction => interaction.regex.test(transcript));
    
    if (interaction) {
      const match = interaction.regex.exec(transcript);
      
      if (match) {
        const interactionResponse = fleshOutInteractionResponse(
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
      return this.parent.handleTranscript(transcript);
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
