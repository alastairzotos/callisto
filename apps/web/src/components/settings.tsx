import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material';
import { ServerSettings } from './server-settings';
import { PluginSettings } from './plugn-settings';

const Wrapper = styled('div')(({ theme }) => ({
  margin: theme.spacing(2, 2, -2, 0),
  display: 'flex',
  justifyContent: 'flex-end'
}))

export const Settings: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectServerModalOpen, setSelectServerModalOpen] = useState(false);
  const [pluginsModalOpen, setPluginsModalOpen] = useState(false);

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
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setPluginsModalOpen(true);
            }}
          >
            Plugins
          </MenuItem>
        </Menu>
      </Wrapper>
      
      <ServerSettings
        open={selectServerModalOpen}
        onClose={() => setSelectServerModalOpen(false)}
      />

      <PluginSettings
        open={pluginsModalOpen}
        onClose={() => setPluginsModalOpen(false)}
      />
     
    </>
  )
}