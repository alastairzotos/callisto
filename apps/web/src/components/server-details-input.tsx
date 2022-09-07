import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

interface Props {
  cta: string;
  serverName?: string;
  serverHost?: string;
  onCancel: () => void;
  onUpdate: (name: string, host: string) => void;
}

export const ServerDetailsInput: React.FC<Props> = ({ cta, serverName = '', serverHost = '', onCancel, onUpdate }) => {
  const [name, setName] = useState(serverName);
  const [host, setHost] = useState(serverHost);

  return (
    <>
      <Box component="form" sx={{ display: 'flex', pb: 2, '& > :not(style)': { m: 1 }, }}>
        <TextField label="Name" variant="standard" sx={{ width: '40%' }} value={name} onInput={e => setName((e.target as any).value)} />
        <TextField label="Host" variant="standard" sx={{ width: '60%' }} value={host} onInput={e => setHost((e.target as any).value)} />
      </Box>

      <Box component="form" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button color='secondary' onClick={onCancel}>Cancel</Button>
        <Button color='primary' onClick={() => onUpdate(name, host)}>{cta}</Button>
      </Box>
    </>
  )
}