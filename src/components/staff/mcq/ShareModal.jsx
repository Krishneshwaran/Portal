import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  TextField,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CopyIcon from '@mui/icons-material/FileCopy';

const ShareModal = ({ open, onClose, shareLink, handleCopyLink }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <DialogContent
        sx={{
          backgroundColor: '#f9faff',
          borderRadius: '12px',
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
          p: 4,
          textAlign: 'center',
        }}
      >
        <DialogTitle sx={{ mb: 2 }}>Share Link</DialogTitle>
        <Box display="flex" justifyContent="center" mb={2}>
          <IconButton
            onClick={() => window.open(`https://wa.me/?text=${shareLink}`, "_blank")}
          >
            <WhatsAppIcon style={{ color: "#25D366" }} />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '8px',
              },
            }}
          />
          <IconButton onClick={handleCopyLink} sx={{ ml: 2 }}>
            <CopyIcon />
          </IconButton>
        </Box>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
