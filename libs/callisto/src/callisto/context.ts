import { Interaction, InteractionHandler, InteractionHandlerResponse } from "../models/callisto.models";
import { simplifyInteractionResponse } from "../utils/interaction-response";

export class CallistoContext {
  private interactions: Interaction[] = [];
  private prompts: string[] = [];

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

  addInteraction(pluginId: string, regex: string | string[], handler: InteractionHandler) {
    if (typeof regex === 'string') {
      this.interactions.push({
        pluginId,
        regex: new RegExp(`^${regex}$`, 'i'),
        handler
      });
    } else {
      regex.forEach(r => this.addInteraction(pluginId, r, handler));
    }

    return this;
  }

  addInteractions(pluginId: string, interactions: { [regex: string]: InteractionHandler }) {
    Object.keys(interactions).forEach(regex => this.addInteraction(pluginId, regex, interactions[regex]));

    return this;
  }

  removeInteractions(pluginId) {
    this.interactions = this.interactions.filter(interaction => interaction.pluginId !== pluginId);
  }

  addPrompts(promps: string[]) {
    this.prompts.push(...promps);

    return this;
  }

  getPrompts() {
    return this.prompts;
  }
}
