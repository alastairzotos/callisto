import { useEffect, useState } from "react";
import { InteractionResponse } from "../models/context.models";
import { CallistoService } from "../services/callisto.service";

export const useCallisto = (callisto: CallistoService) => {
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

  const handleSetNoMatch = () => {
    setLoading(false);
    setNoMatch(true);
  }

  useEffect(() => {
    callisto.onInterim(handleSetInterim);
    callisto.onResult(setResult);
    callisto.onWaiting(() => setLoading(true));
    callisto.onNoMatch(handleSetNoMatch);
    callisto.onResponse(handleSetResponse);
  }, []);

  return { interim, result, loading, noMatch, response };
}
