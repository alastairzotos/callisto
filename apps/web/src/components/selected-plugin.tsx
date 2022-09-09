import React, { useEffect } from 'react'
import { Button, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { useCallisto } from '../state';
import { Spacer } from './spacer';

export const SelectedPlugin: React.FC = () => {
  const [
    pluginLoadStatus,
    selectedPlugin,
    selectPlugin,
    installSelectedPlugin,
    installStatus,
    connectionStatus,
  ] = useCallisto(s => [s.pluginLoadStatus, s.selectedPlugin, s.selectPlugin, s.installSelectedPlugin, s.installStatus, s.connectionStatus]);

  return (
    <>
      {pluginLoadStatus === 'fetching' && <LinearProgress />}
      {pluginLoadStatus === 'failure' && <Typography>There was an error loading the plugin</Typography>}
      {(pluginLoadStatus === 'success' && !!selectedPlugin) && (
        <>
          <div>
            <Typography variant="h6">Plugin: {selectedPlugin.name}</Typography>
          </div>

          <Spacer />

          <Button
            disabled={installStatus === 'fetching'}
            onClick={() => selectPlugin(undefined)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={installStatus === 'fetching' || connectionStatus !== 'connected'}
            onClick={installSelectedPlugin}
          >
            {installStatus === 'fetching' ? <CircularProgress size={18} /> : 'Install'}
          </Button>

          {installStatus === 'failure' && <Typography>There was an error installing the plugin</Typography>}
        </>
      )}
    </>
  )
}
