import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const ShareModal = ({ open, onClose, shareLink }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Link</DialogTitle>
      <DialogContent>
        <p>Share this link with your students:</p>
        <a href={shareLink} target="_blank" rel="noopener noreferrer">
          {shareLink}
        </a>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
