import { split } from "sentence-splitter";

export class WikipediaIntegration {
  async getSummary(query: string): Promise<string[]> {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`);
    const data = await res.json();

    if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      return [`Sorry, I can't find anything on ${query}`]
    }

    const sentences = split(data.extract).filter(sentence => sentence.type === 'Sentence').map(sentence => sentence.raw);
    return sentences;
  }
}

export const wikipediaIntegration = new WikipediaIntegration();
