import fetch from 'node-fetch';
import { split } from "sentence-splitter";

export const getSummary = async (query: string): Promise<string[]> => {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`);
    const data = await res.json() as any;

    if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      return [`Sorry, I can't find anything on ${query}`]
    }

    return split(data.extract)
      .filter(sentence => sentence.type === 'Sentence')
      .map(sentence => sentence.raw);
  } catch {
    return ['There was an error getting the information']
  }
}
