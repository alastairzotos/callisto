import React, { useEffect, useState } from 'react';
import { Typography, styled, Chip } from '@mui/material';
import { SpeechInputAdapter } from '@bitmetro/callisto';

interface Props {
  speechInputAdapter: SpeechInputAdapter;
  responseText: string;
}

const Wrapper = styled('div')(() => ({
  paddingTop: 100,
}))

const Bubble = styled('div')<{ type: 'input' | 'response' }>(({ type, theme }) => ({
  backgroundColor: type === 'input' ? theme.palette.grey[800] : theme.palette.primary.dark,
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  maxWidth: '65%',
  borderRadius: 20
}))

const InputWrapper = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'flex-end'
}))

const firstUppercase = (text: string) =>
  (text && text.length) ? text[0].toLocaleUpperCase() + text.slice(1) : ''

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
      {(result || interim) && (
        <InputWrapper>
          <Bubble type='input'>
            <Typography>{firstUppercase(result || interim)}</Typography>
          </Bubble>
        </InputWrapper>
      )}

      {response && (
        <Bubble type='response'>
          <Typography>{response}</Typography>
        </Bubble>
      )}
    </Wrapper>
  )
}
