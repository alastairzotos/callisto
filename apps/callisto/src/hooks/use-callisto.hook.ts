import { useEffect, useState } from "react";
import { CallistoService, InteractionResponse } from '@bitmetro/callisto';

export const useCallisto = (callisto: CallistoService) => {
  const [listening, setListening] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [response, setResponse] = useState('');

  const handleSetInterim = (transcript: string) => {
    setNoMatch(false);
    setResult('');
    setResponse('');
    setInterim(transcript);
  }

  const handleSetResponse = async (response: InteractionResponse) => {
    setLoading(false);
    setNoMatch(false);
    setResponse(response.responseText);
  }

  const handleSetNoMatch = async () => {
    setLoading(false);
    setNoMatch(true);
  }

  useEffect(() => {
    callisto.addListeningListener(setListening);
    callisto.addInterimListener(handleSetInterim);
    callisto.addFinalResultListener(setResult);
    callisto.addWaitingListener(() => setLoading(true));
    callisto.addNoMatchListener(handleSetNoMatch);
    callisto.addResponseListener(handleSetResponse);
    callisto.addEnabledListener(setEnabled);
  }, []);

  return { enabled, listening, interim, result, loading, noMatch, response };
}
