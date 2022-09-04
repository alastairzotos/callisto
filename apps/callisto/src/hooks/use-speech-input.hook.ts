import { useEffect, useState } from "react";
import { SpeechInputAdapter } from '@bitmetro/callisto';

export const useSpeechInput = (speechInputAdapter: SpeechInputAdapter) => {
  const [listening, setListening] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState('');
  const [matchFound, setMatchFound] = useState(true);
  const [response, setResponse] = useState('');

  useEffect(() => {
    speechInputAdapter.callisto.addEventHandlers({
      onMatchingInteractionFound: async matchFound => setMatchFound(matchFound),
      onResponse: async response => setResponse(response.responseText),
    })

    speechInputAdapter.addEventHandlers({
      onListening: setListening,
      onInterim: setInterim,
      onResult: setResult,
      onEnabled: setEnabled,
    })
  }, []);

  return { enabled, listening, interim, result, matchFound, response };
}
