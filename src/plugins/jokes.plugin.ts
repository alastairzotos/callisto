import { jokesIntegration } from "../integrations/jokes.integration";
import { CallistoPlugin } from "../models/service.models";

export const jokesPlugin: CallistoPlugin = ctx => {
  ctx.addInteraction("tell me a joke", async () => {
    const joke = await jokesIntegration.getJoke();

    return joke;
  });
}
