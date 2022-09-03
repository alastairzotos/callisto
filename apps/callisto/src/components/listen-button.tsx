import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Button, styled } from '@mui/material';
import { CallistoService } from '@bitmetro/callisto';

import { useCallisto } from '../hooks/use-callisto.hook';
import { useInterval } from '../hooks/use-interval.hook';

interface Props {
  callisto: CallistoService;
  onCancel: () => void;
}

const StyledButton = styled(Button)(() => ({
  borderRadius: 50,
  padding: 20,
  width: '100%'
}))

const Prompt = styled('span')(() => ({
  opacity: 0
}))

const EASING_DURATION = 4000;

export const ListenButton: React.FC<Props> = ({ callisto, onCancel }) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const { enabled, listening } = useCallisto(callisto);
  const promptRef = useRef() as MutableRefObject<HTMLSpanElement>;

  useInterval(() => {
    const next = Math.floor(Math.random() * prompts.length);

    setPromptIndex(next);
  }, EASING_DURATION);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.animate(
        {
          opacity: [0, 1, 0],
          easing: 'cubic-bezier(.03,1.01,.12,.98)'
        },
        EASING_DURATION,
      );
    }
  }, [promptIndex]);

  const prompts = callisto.getAllPrompts();

  return (
    <StyledButton
      variant="contained"
      color={enabled ? 'primary' : 'warning'}
      onMouseDown={() => enabled && callisto.startRecognition()}
      onMouseUp={() => enabled && callisto.stopRecognition()}
      onTouchStart={() => enabled && callisto.startRecognition()}
      onTouchEnd={() => enabled && callisto.stopRecognition()}
      disabled={listening}
      onClick={() => !enabled && onCancel()}
    >
      {
        !enabled
          ? 'Cancel'
          : (
            listening
              ? 'Listening'
              : (
                <Prompt ref={promptRef} style={{ opacity: 0 }}>{prompts[promptIndex]}</Prompt>
              )
          )
      }
    </StyledButton>
  )
}
