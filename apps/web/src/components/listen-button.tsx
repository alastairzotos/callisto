import React from 'react';
import { Button, styled } from '@mui/material';

import { Prompts } from './prompts';
import { useCallisto, useSpeech } from '../state';

const Wrapper = styled('div')(() => ({
  width: '100%',
  position: 'fixed',
  bottom: 80,
  display: 'flex',
  justifyContent: 'center'
}))

const StyledButton = styled(Button)(() => ({
  borderRadius: 50,
  padding: 20,
  width: '90%',
  maxHeight: 64,
}))

export const ListenButton: React.FC = () => {
  const { connectionStatus, prompts } = useCallisto();

  const {
    listening,
    speechResult,
    input,
    cancelSpeech,
  } = useSpeech();

  const speaking = !!speechResult;

  const disconnected = connectionStatus !== 'connected';

  const handleClick = () => {
    if (speaking) {
      cancelSpeech();
    } else {
      input?.startRecognition();
    }
  }

  return (
    <Wrapper>
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
    </Wrapper>
  )
}
