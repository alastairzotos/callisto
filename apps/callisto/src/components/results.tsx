import React, { useEffect, useState } from 'react';
import { Typography, styled } from '@mui/material';
import { SpeechInputAdapter } from '@bitmetro/callisto';

interface Props {
  speechInputAdapter: SpeechInputAdapter;
  responseText: string;
}

const Wrapper = styled('div')(() => ({
  paddingTop: 100,
}))

const Response = styled(Typography)(() => ({
  fontFamily: 'monospace'
}))

export const Results: React.FC<Props> = ({ speechInputAdapter, responseText }) => {
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState('');
  const [response, setResponse] = useState(responseText);

  useEffect(() => {
    speechInputAdapter.onInterim.attach(setInterim);
    speechInputAdapter.onResult.attach(async result => setResult(result));
    speechInputAdapter.onListening.attach(listening => {
      if (listening) {
        setResult('');
      }
      setResponse('')
    })
  }, []);

  useEffect(() => setResponse(responseText), [responseText]);

  return (
    <Wrapper>
      {
        result
          ? <Typography>{'>'} {result}</Typography>
          : <Typography>{interim}</Typography>
      }

      {response && <Response>{response}</Response>}
    </Wrapper>
  )
}
