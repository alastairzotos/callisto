import { CallistoContext } from "../callisto/context";
import { jokesIntegration } from "../integrations/jokes.integration";
import { CallistoPlugin } from "../models/service.models";

export const jokesPlugin: CallistoPlugin = ctx => {
  ctx.addInteraction("tell me a joke", async () => {
    const joke = await jokesIntegration.getJoke();

    return {
      responseText: joke,
      context: new CallistoContext(ctx)
        .addInteraction('tell me another one', async () => await jokesIntegration.getJoke())
        .addInteraction('and another one', async () => await jokesIntegration.getJoke())
        .addInteraction('and another', async () => await jokesIntegration.getJoke())
        .addInteraction('another', async () => await jokesIntegration.getJoke())
        .addInteraction('another one', async () => await jokesIntegration.getJoke())
    };
  });
}
