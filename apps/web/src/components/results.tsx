import React, { useEffect, useState } from 'react';
import { Typography, styled } from '@mui/material';
import { SpeechInputAdapter } from '@bitmetro/callisto';

interface Props {
  interim: string;
  speechResultText: string;
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

export const Results: React.FC<Props> = ({ interim, speechResultText, responseText }) => {
  return (
    <Wrapper>
      {(speechResultText || interim) && (
        <InputWrapper>
          <Bubble type='input'>
            <Typography>{firstUppercase(speechResultText || interim)}</Typography>
          </Bubble>
        </InputWrapper>
      )}

      {responseText && (
        <Bubble type='response'>
          <Typography>{responseText}</Typography>
        </Bubble>
      )}
    </Wrapper>
  )
}
