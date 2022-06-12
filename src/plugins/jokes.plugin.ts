import { CallistoContext } from "../callisto/context";
import { jokesIntegration } from "../integrations/jokes.integration";
import { CallistoPlugin } from "../models/service.models";

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
}