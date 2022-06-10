export class WikipediaIntegration {
  async getSummary(query: string): Promise<string> {
    const props = {
      action: 'query',
      format: 'json',
      prop: 'extracts',
      exintro: '',
      explaintext: '',
      origin: '*',
      exsentences: '1',
      titles: query,
    };

    const res = await fetch(`https://en.wikipedia.org/w/api.php?${new URLSearchParams(props)}`);

    const data = await res.json();

    return data.query.pages[Object.keys(data.query.pages)[0]].extract;
  }
}

export const wikipediaIntegration = new WikipediaIntegration();
