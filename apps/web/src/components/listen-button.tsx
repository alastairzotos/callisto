import React, { useCallback, useEffect, useState } from 'react';
import { Button, styled } from '@mui/material';
import { SpeechInputAdapter, SpeechResult } from '@bitmetro/callisto';

import { Prompts } from './prompts';

interface Props {
  disconnected: boolean;
  speaking: boolean;
  onCancel: () => void;
  prompts: string[];
  speechInputAdapter: SpeechInputAdapter;
}

const StyledButton = styled(Button)(() => ({
  borderRadius: 50,
  padding: 20,
  width: '100%',
  maxHeight: 64
}))

export const ListenButton: React.FC<Props> = ({ disconnected, speaking, onCancel, prompts, speechInputAdapter }) => {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    speechInputAdapter.onListening.attach(setListening);
  }, []);

  const handleClick = () => {
    if (speaking) {
      onCancel();
    } else {
      speechInputAdapter.startRecognition();
    }
  }

  return (
    <StyledButton
      variant="contained"
      color={!speaking ? 'primary' : 'warning'}
      onClick={handleClick}
      disabled={disconnected || listening}
    >
      {
        disconnected
          ? 'Disconnected'
          : (
            speaking
              ? 'Cancel'
              : (
                listening
                  ? 'Listening'
                  : <Prompts prompts={prompts} cycleDuration={4000} />
              )
          )
      }
    </StyledButton>
  )
}
