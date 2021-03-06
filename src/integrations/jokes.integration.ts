
export class JokesIntegration {
  async getJoke() {
    const res = await fetch("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json"
      }
    });

    const data = await res.json();

    return data.joke;
  }
}

export const jokesIntegration = new JokesIntegration();
