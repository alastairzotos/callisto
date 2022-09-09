import { styled } from '@mui/material';

export const Spacer = styled('div')<{ size?: number }>(({ size = 1, theme }) => ({
  padding: theme.spacing(size)
}));
