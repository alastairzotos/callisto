import { CallistoContext, CallistoPlugin } from '@bitmetro/callisto';
import { jokesIntegration } from "../integrations/jokes.integration";

export const jokesPlugin: CallistoPlugin = ctx => {
  ctx
    .addPrompts(['Ask me for a joke', 'Ask me to tell you a joke'])
    .addInteraction("tell me a joke", async () => {
      const joke = await jokesIntegration.getJoke();

      return {
        responseText: joke,
        context: new CallistoContext(ctx)
          .addPrompts(['Try asking for another one'])
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
}
