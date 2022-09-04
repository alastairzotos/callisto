import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';

import { CallistoService } from '@bitmetro/callisto';
import { useInterval } from '../hooks/use-interval.hook';

interface Props {
  callisto: CallistoService;
  cycleDuration: number;
}

const Prompt = styled('span')(() => ({
  opacity: 0
}))

export const Prompts: React.FC<Props> = ({ callisto, cycleDuration }) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const promptRef = useRef() as MutableRefObject<HTMLSpanElement>;

  const contextChain = callisto.getContextChain();
  const prompts = contextChain.map(ctx => ctx.getPrompts()).flat();

  useInterval(() => {
    const next = Math.floor(Math.random() * prompts.length);

    setPromptIndex(next);
  }, cycleDuration);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.animate(
        {
          opacity: [0, 1, 0],
          easing: 'cubic-bezier(.03,1.01,.12,.98)'
        },
        cycleDuration,
      );
    }
  }, [promptIndex]);

  return <Prompt ref={promptRef} style={{ opacity: 0 }}>{prompts[promptIndex]}</Prompt>;
}
