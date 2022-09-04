import React from 'react';
import { Button, styled } from '@mui/material';
import { SpeechInputAdapter } from '@bitmetro/callisto';

import { useSpeechInput } from '../hooks/use-speech-input.hook';
import { Prompts } from './prompts';

interface Props {
  speechInputAdapter: SpeechInputAdapter;
  onCancel: () => void;
}

const StyledButton = styled(Button)(() => ({
  borderRadius: 50,
  padding: 20,
  width: '100%'
}))

export const ListenButton: React.FC<Props> = ({ speechInputAdapter, onCancel }) => {
  const { enabled, listening } = useSpeechInput(speechInputAdapter);

  return (
    <StyledButton
      variant="contained"
      color={enabled ? 'primary' : 'warning'}
      onMouseDown={() => speechInputAdapter.startRecognition()}
      onTouchStart={() => speechInputAdapter.startRecognition()}
      disabled={listening}
      onClick={() => !enabled && onCancel()}
    >
      {
        !enabled
          ? 'Cancel'
          : (
            listening
              ? 'Listening'
              : <Prompts callisto={speechInputAdapter.callisto} cycleDuration={4000} />
          )
      }
    </StyledButton>
  )
}
