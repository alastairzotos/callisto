import React, { useEffect, useState } from 'react';
import { Typography, styled } from '@mui/material';
import { SpeechInputAdapter } from '@bitmetro/callisto';

import { useSpeechInput } from '../hooks/use-speech-input.hook';

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
  const { interim, result, matchFound, response } = useSpeechInput(speechInputAdapter);

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
