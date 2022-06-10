import React, { useEffect, useState } from 'react';
import { InteractionResponse } from '../models/context.models';
import { CallistoService } from '../services/callisto.service';

interface Props {
  callisto: CallistoService;
  interimComponent?: React.FC<{ transcript: string }>;
  resultComponent?: React.FC<{ transcript: string }>;
  loadingComponent?: React.FC;
  noMatchComponent?: React.FC;
  responseComponent?: React.FC<{ response: string }>;
}

export const Manager: React.FC<Props> = ({
  callisto,
  interimComponent = ({ transcript }) => <samp>{transcript}</samp>,
  resultComponent = ({ transcript }) => <samp>{'>'} {transcript}</samp>,
  loadingComponent = () => <p>...</p>,
  noMatchComponent = () => <p>No match</p>,
  responseComponent = ({ response }) => <p>{response}</p>,
}) => {
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

  return (
    <>
      {
        result
          ? resultComponent({ transcript: result })
          : interimComponent({ transcript: interim })
      }

      {loading && loadingComponent({})}
      {noMatch && noMatchComponent({})}
      {response && responseComponent({ response })}
    </>
  );
}
