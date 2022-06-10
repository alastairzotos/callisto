import { Interaction, InteractionHandler, InteractionResponse } from "../models/context.models";

interface InteractionHandlerResponse {
  error: boolean;
  interactionResponse?: InteractionResponse;
  matchingContext?: CallistoContext;
}

export class CallistoContext {
  private interactions: Interaction[] = [];

  constructor(public parent?: CallistoContext) {}

  async handleTranscript(transcript: string): Promise<InteractionHandlerResponse> {
    const interaction = this.interactions.find(interaction => interaction.regex.test(transcript));
    
    if (interaction) {
      const match = interaction.regex.exec(transcript);
      
      if (match) {
        const interactionResponse = await interaction.handler([...match?.slice(1).map(i => i ? i.trim() : i)]);

        return {
          error: false,
          matchingContext: interactionResponse.context || this,
          interactionResponse,
        }
      }
    }

    if (this.parent) {
      return this.parent.handleTranscript(transcript);
    }

    return { error: true }
  }

  addInteraction(regex: RegExp, handler: InteractionHandler) {
    this.interactions.push({ regex, handler });

    return this;
  }
}
