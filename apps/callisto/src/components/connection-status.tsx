import { CircularProgress, Typography, keyframes, styled } from '@mui/material';
import React from 'react';
import { ConnectionStatus } from '../models';

interface Props {
  status: ConnectionStatus;
}

const fadeInAndOut = keyframes`
  0%,100% { opacity: 0 }
  50% { opacity: 1 }
`

const SuccessIndicator = styled('span')(() => ({
  color: 'rgb(0, 255, 0)',
  animation: `${fadeInAndOut} 4s linear infinite`,
}))

export const ConnectionStatusDisplay: React.FC<Props> = ({ status }) => {

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 50 }}>
      {
        status === 'connecting'
          ? <Typography variant='subtitle2'>Connecting...</Typography>
          : (
            status === 'connected'
              ? <Typography variant='subtitle2'><SuccessIndicator>&#9679;</SuccessIndicator> Connected</Typography>
              : <Typography variant='subtitle2' color='error'><CircularProgress size={10} /> Connection lost. Retrying..</Typography>
          )
      }
    </div>
  )
}
