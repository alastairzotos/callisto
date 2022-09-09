import React from 'react';
import { Box, Modal, Typography, styled } from '@mui/material';
import { Spacer } from './spacer';

export interface BasicModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
}

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

export const BasicModal: React.FC<React.PropsWithChildren<BasicModalProps>> = ({ title, open, onClose, children }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>

        <Spacer />

        {children}
      </ModalBox>
    </Modal>
  )
}
