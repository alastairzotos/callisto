import { CallistoContext, CallistoPlugin } from '@bitmetro/callisto';
import { jokesIntegration } from "../integrations/jokes.integration";

export const jokesPlugin: CallistoPlugin = ctx => {
  ctx.addInteraction("tell me a joke", async () => {
    const joke = await jokesIntegration.getJoke();

    return {
      responseText: joke,
      context: new CallistoContext(ctx)
        .addInteraction(
          [
            'tell me another one',
            'and another one',
            'and another',
            'another',
            'another one',
            'another joke',
            'tell me another joke',
          ],
          async () => await jokesIntegration.getJoke()
        )
    };
  });

  return {
    prompts: ['Ask me for a joke']
  }
}
