import React, { useState } from 'react';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { Box, Button, Modal, styled, Typography } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Check from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import { useCallisto } from '../state';
import { ServerDetailsInput } from './server-details-input';

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ServerSettings: React.FC<Props> = ({ open, onClose }) => {
  const {
    knownServers,
    selectedServerName,
    setSelectedServer,
    addServer,
    modifyServer,
  } = useCallisto();

  const [addingServer, setAddingServer] = useState(false);
  const [edittingServer, setEdittingServer] = useState<string | null>(null);

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, selectedServerName: string) => {
    e.stopPropagation();
    setEdittingServer(selectedServerName);
  }

  const onCreate = (name: string, host: string) => {
    setAddingServer(false);
    addServer(name, host);
  }

  const onEdit = (name: string, host: string) => {
    modifyServer(edittingServer!, name, host);
    setEdittingServer(null);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Typography variant="h6" component="h2">
          Select server
        </Typography>

        <MenuList>
          {
            Object.keys(knownServers || {}).map(name => (
              <MenuItem
                key={name}
                onClick={() => {
                  onClose();
                  setSelectedServer(name);
                }}
              >
                <ListItemText inset={name !== selectedServerName}>
                  {name === selectedServerName && (
                    <ListItemIcon>
                      <Check />
                    </ListItemIcon>
                  )}
                  {name}
                </ListItemText>

                {(!addingServer && !edittingServer) && (
                  <IconButton onClick={e => handleEditClick(e, name)}>
                    <EditIcon />
                  </IconButton>
                )}
              </MenuItem>
            ))
          }
        </MenuList>

        {(!addingServer && !edittingServer) && <Button onClick={() => setAddingServer(true)}>Add server</Button>}
        
        {addingServer && (
          <ServerDetailsInput
            cta='Create'
            onCancel={() => setAddingServer(false)}
            onUpdate={(name, host) => onCreate(name, host)}
          />
        )}

        {edittingServer && (
          <ServerDetailsInput
            cta='Edit'
            serverName={edittingServer}
            serverHost={knownServers![edittingServer]}
            onCancel={() => setEdittingServer(null)}
            onUpdate={(name, host) => onEdit(name, host)}
          />
        )}

      </ModalBox>
    </Modal>
  )
}
