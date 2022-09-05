import React, { useEffect, useState } from 'react';
import { Typography, styled } from '@mui/material';
import { CallistoService, SpeechInputAdapter } from '@bitmetro/callisto';

interface Props {
  callisto: CallistoService;
  speechInputAdapter: SpeechInputAdapter;
}

const Wrapper = styled('div')(() => ({
  paddingTop: 100,
}))

const Response = styled(Typography)(() => ({
  fontFamily: 'monospace'
}))

export const Results: React.FC<Props> = ({ callisto, speechInputAdapter }) => {
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState('');
  const [matchFound, setMatchFound] = useState(true);
  const [response, setResponse] = useState('');

  useEffect(() => {
    callisto.onResponse.attach(async ({ error, interactionResponse }) => {
      if (error) {
        setMatchFound(false);
      } else {
        setMatchFound(true);
        setResponse(interactionResponse?.responseText!);
      }
    })

    speechInputAdapter.onInterim.attach(setInterim);
    speechInputAdapter.onResult.attach(async result => setResult(result));
    speechInputAdapter.onListening.attach(listening => {
      if (listening) {
        setResult('');
      }
      setResponse('')
    })
  }, []);

  return (
    <Wrapper>
      {
        result
          ? <Typography>{'>'} {result}</Typography>
          : <Typography>{interim}</Typography>
      }

      {!matchFound ? <Response>No match</Response> : response && <Response>{response}</Response>}
    </Wrapper>
  )
}
