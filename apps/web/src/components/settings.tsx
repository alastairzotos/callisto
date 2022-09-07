import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Modal, styled, Typography } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Check from '@mui/icons-material/Check';

const Wrapper = styled('div')(({ theme }) => ({
  margin: theme.spacing(2, 2, -2, 0),
  display: 'flex',
  justifyContent: 'flex-end'
}))

const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
}));

interface Props {
  selectedServer?: string;
  knownServers: { [name: string]: string };
  onSelectServer: (name: string) => void;
}

export const Settings: React.FC<Props> = ({ selectedServer, knownServers, onSelectServer }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectServerModalOpen, setSelectServerModalOpen] = useState(false);

  return (
    <>
      <Wrapper>
        <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            style: {
              width: '20ch',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setSelectServerModalOpen(true)
            }}
          >
            Select server
          </MenuItem>
        </Menu>
      </Wrapper>

      <Modal
        open={selectServerModalOpen}
        onClose={() => setSelectServerModalOpen(false)}
      >
        <ModalBox>
          <Typography variant="h6" component="h2">
            Select server
          </Typography>
          <MenuList>
            {
              Object.keys(knownServers).map(name => (
                <MenuItem
                  key={name}
                  onClick={() => {
                    setSelectServerModalOpen(false)
                    onSelectServer(name)
                  }}
                >
                  {
                    name === selectedServer
                      ? (
                        <>
                          <ListItemIcon>
                            <Check />
                          </ListItemIcon>
                          {name}
                        </>
                      )
                      : (
                        <ListItemText inset>{name}</ListItemText>
                      )
                  }
                </MenuItem>
              ))
            }
          </MenuList>
        </ModalBox>
      </Modal>
    </>
  )
}