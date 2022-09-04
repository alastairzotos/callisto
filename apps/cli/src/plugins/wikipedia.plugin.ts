import { CallistoContext, CallistoPlugin, InteractionHandler } from '@bitmetro/callisto';
import { wikipediaIntegration } from "../integrations/wikipedia.intergration"

export const wikipediaPlugin: CallistoPlugin = ctx => {
  const handler: InteractionHandler = async ([topic]) => {
    const sentences = await wikipediaIntegration.getSummary(topic);

    let sentenceIndex = 0;

    return {
      responseText: sentences[0],
      context: (new CallistoContext(ctx))
        .addInteraction(
          [
            'tell me more',
            'continue',
            'more'
          ],
          async () => {
            if (sentenceIndex >= sentences.length - 1) {
              return `That's all I can tell you about ${topic}`
            }

            return sentences[++sentenceIndex];
          }
        )
    }
  };

  ctx.addInteraction("tell me about (.+)", handler);
  ctx.addInteraction("what is a (.+)", handler);
  ctx.addInteraction("what is the (.+)", handler);
  ctx.addInteraction("what is (.+)", handler);
  ctx.addInteraction("what was a (.+)", handler);
  ctx.addInteraction("what was the (.+)", handler);
  ctx.addInteraction("what was (.+)", handler);
  ctx.addInteraction("who was (.+)", handler);
  ctx.addInteraction("who is (.+)", handler);
  ctx.addInteraction("where was (.+)", handler);
  ctx.addInteraction("where is (.+)", handler);

  return {
    prompts: ['Try "tell me about Rome"', 'Ask me about Einstein']
  }
}
