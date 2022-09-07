import { CircularProgress, Typography, keyframes, styled } from '@mui/material';
import React from 'react';
import { ConnectionStatus } from '../models';

interface Props {
  status: ConnectionStatus;
  serverName?: string;
}

const fadeInAndOut = keyframes`
  0%,100% { opacity: 0 }
  50% { opacity: 1 }
`

const Wrapper = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  position: 'fixed',
  bottom: 20,
  zIndex: 1000
}))

const SuccessIndicator = styled('span')(() => ({
  color: 'rgb(0, 255, 0)',
  animation: `${fadeInAndOut} 4s linear infinite`,
}))

export const ConnectionStatusDisplay: React.FC<Props> = ({ serverName, status }) => {
  return (
    <Wrapper>
      {
        !serverName
          ? 'No server selected'
          : (
            status === 'connecting'
              ? <Typography variant='subtitle2'>Connecting to {serverName} server...</Typography>
              : (
                status === 'connected'
                  ? <Typography variant='subtitle2'><SuccessIndicator>&#9679;</SuccessIndicator> Connected to server: {serverName}</Typography>
                  : <Typography variant='subtitle2' color='error'><CircularProgress size={10} /> Connection lost. Retrying..</Typography>
              )
          )
      }
    </Wrapper>
  )
}
