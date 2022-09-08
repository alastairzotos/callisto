import React from 'react';
import { Typography, styled } from '@mui/material';
import { useCallisto } from '../state';

const Wrapper = styled('div')(() => ({
  paddingTop: 60,
}))

const Bubble = styled('div')<{ type: 'input' | 'response' }>(({ type, theme }) => ({
  backgroundColor: type === 'input' ? theme.palette.grey[800] : theme.palette.primary.dark,
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  maxWidth: '75%',
  borderRadius: 20
}))

const InputWrapper = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'flex-end'
}))

const firstUppercase = (text: string) =>
  (text && text.length) ? text[0].toLocaleUpperCase() + text.slice(1) : ''

export const Results: React.FC = () => {
  const {
    interimText,
    speechResultText,
    responseText,
  } = useCallisto();

  return (
    <Wrapper>
      {(speechResultText || interimText) && (
        <InputWrapper>
          <Bubble type='input'>
            <Typography>{firstUppercase(speechResultText || interimText)}</Typography>
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
