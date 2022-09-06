import React from 'react';
import { styled } from '@mui/material';

const Wrapper = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  marginTop: 50
}));

const LogoImg = styled('img')(() => ({
  width: 200,
}))

export const Logo: React.FC = () => {
  return (
    <Wrapper>
      <LogoImg src='/logo-full.png' />
    </Wrapper>
  )
}
