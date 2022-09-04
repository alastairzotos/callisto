import { CallistoContext, CallistoPlugin, InteractionHandler } from '@bitmetro/callisto';
import { wikipediaIntegration } from "../integrations/wikipedia.intergration"

export const wikipediaPlugin: CallistoPlugin = ctx => {
  const handler: InteractionHandler = async ([topic]) => {
    const sentences = await wikipediaIntegration.getSummary(topic);

    let sentenceIndex = 0;

    return {
      responseText: sentences[0],
      context: (new CallistoContext(ctx))
        .addPrompts(['Shall I continue?', 'Do you want to know more?', 'Do you want me to tell you more?'])
        .addInteraction(
          ['tell me more', 'continue', 'more'],
          async () => {
            if (sentenceIndex >= sentences.length - 1) {
              return `That's all I can tell you about ${topic}`
            }

            return sentences[++sentenceIndex];
          }
        )
    }
  };

  ctx
    .addPrompts(['Try "tell me about Rome"', 'Ask me about Einstein'])
    .addInteraction("tell me about (.+)", handler)
    .addInteraction("what is a (.+)", handler)
    .addInteraction("what is the (.+)", handler)
    .addInteraction("what is (.+)", handler)
    .addInteraction("what was a (.+)", handler)
    .addInteraction("what was the (.+)", handler)
    .addInteraction("what was (.+)", handler)
    .addInteraction("who was (.+)", handler)
    .addInteraction("who is (.+)", handler)
    .addInteraction("where was (.+)", handler)
    .addInteraction("where is (.+)", handler)
}
