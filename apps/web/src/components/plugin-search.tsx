import React, { useEffect, useRef, useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import { Typography, Box, List, ListItemButton, ListItemText } from '@mui/material';
import { useDebounce } from 'use-debounce';
import { useCallisto } from '../state';
import { PluginListItemDto } from '../models';


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: '30%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export const PluginSearch: React.FC = () => {
  const [registry, search, searchResults, selectPlugin] = useCallisto(s => [s.registry, s.searchPlugins, s.pluginSearchResults, s.selectPlugin]);
  const [value, setValue] = useState('');

  const [searchText] = useDebounce(value, 500);

  useEffect(() => {
    console.log(searchText);

    if (searchText.trim().length > 0) {
      search(searchText)
    }
  }, [searchText]);

  return (
    <>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`Search ${registry}`}
        />
      </Search>

      {
        searchResults.length > 0
          ? (
            <List sx={{ maxHeight: 200, overflowY: 'scroll' }}>
              {
                searchResults.map(plugin => (
                  <ListItemButton
                    key={plugin._id}
                    onClick={() => selectPlugin(plugin)}
                  >
                    <ListItemText primary={plugin.name} />
                  </ListItemButton>
                ))
              }
            </List>
          )
          : (
            <Box sx={{ p: 2 }}>
              <Typography>No results</Typography>
            </Box>
          )
      }
    </>
  )
}
