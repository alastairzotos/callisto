import React, { useEffect, useState } from 'react';
import { Typography, styled } from '@mui/material';
import { CallistoOutputAdapter, SpeechInputAdapter } from '@bitmetro/callisto';

interface Props {
  speechInputAdapter: SpeechInputAdapter;
}

const Wrapper = styled('div')(() => ({
  paddingTop: 100,
}))

const Response = styled(Typography)(() => ({
  fontFamily: 'monospace'
}))

export const Results: React.FC<Props> = ({ speechInputAdapter }) => {
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState('');
  const [matchFound, setMatchFound] = useState(true);
  const [response, setResponse] = useState('');

  useEffect(() => {
    const outputAdapter = new CallistoOutputAdapter();
    outputAdapter.handleMatchingInteractionFound = async found => setMatchFound(found);
    outputAdapter.handleResponse = async response => setResponse(response.responseText);
    
    speechInputAdapter.callisto.registerOutputAdapter(outputAdapter);

    speechInputAdapter.addEventHandlers({
      onInterim: setInterim,
      onResult: setResult,
      onListening: () => setResponse('')
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
