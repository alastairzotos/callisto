import React, { useState } from 'react';
import { Button, TextField } from '@mui/material'
import { useCallisto } from '../state';
import { Spacer } from './spacer';

interface Props {
  onClose: () => void;
}

export const RegistryManager: React.FC<Props> = ({ onClose }) => {
  const [registry, setRegistry] = useCallisto(s => [s.registry, s.setRegistry]);

  const [url, setUrl] = useState(registry);

  const handleSetRegistry = () => {
    if (url && url.length) {
      setRegistry(url);
      onClose();
    }
  }

  return (
    <>
      <div>
        <TextField
          label="Registry URL"
          variant="standard"
          sx={{ width: '100%' }}
          value={url}
          onChange={e => setUrl(e.currentTarget.value)}
        />
      </div>

      <Spacer />

      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        color="primary"
        disabled={!url || !url.length}
        onClick={handleSetRegistry}
      >
        Save
      </Button>
    </>
  )
}