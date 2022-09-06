import React, { useEffect, useState } from 'react';
import { Button, styled } from '@mui/material';
import { SpeechInputAdapter, SpeechResult } from '@bitmetro/callisto';

import { Prompts } from './prompts';

interface Props {
  speechResult?: SpeechResult;
  prompts: string[];
  speechInputAdapter: SpeechInputAdapter;
}

const StyledButton = styled(Button)(() => ({
  borderRadius: 50,
  padding: 20,
  width: '100%'
}))

export const ListenButton: React.FC<Props> = ({ speechResult, prompts, speechInputAdapter }) => {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    speechInputAdapter.onListening.attach(setListening);
  }, []);

  return (
    <StyledButton
      variant="contained"
      color={!speechResult ? 'primary' : 'warning'}
      onMouseDown={() => speechInputAdapter.startRecognition()}
      onTouchStart={() => speechInputAdapter.startRecognition()}
      disabled={listening}
      onClick={() => speechResult?.cancel()}
    >
      {
        !!speechResult
          ? 'Cancel'
          : (
            listening
              ? 'Listening'
              : <Prompts prompts={prompts} cycleDuration={4000} />
          )
      }
    </StyledButton>
  )
}
