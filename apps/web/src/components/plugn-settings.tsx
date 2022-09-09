import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { BasicModal } from './basic-modal';
import { useCallisto } from '../state';
import { RegistryManager } from './registry-manager';
import { PluginSearch } from './plugin-search';
import { SelectedPlugin } from './selected-plugin';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PluginSettings: React.FC<Props> = ({ open, onClose }) => {
  const [registry, selectedPluginRef] = useCallisto(s => [s.registry, s.selectedPluginRef]);
  const [managingRegistry, setManagingRegistry] = useState(false);

  return (
    <BasicModal title="Plugins" open={open} onClose={onClose}>
      {(!registry && !managingRegistry) && (
        <>
          <Typography>You don&apos;t have a plugin registry set</Typography>
          <Button onClick={() => setManagingRegistry(true)}>Set registry</Button>
        </>
      )}

      {managingRegistry && <RegistryManager onClose={() => setManagingRegistry(false)} />}

      {(registry && !managingRegistry) && (
        !selectedPluginRef
          ? <PluginSearch />
          : <SelectedPlugin />
      )}
    </BasicModal>
  )
}
