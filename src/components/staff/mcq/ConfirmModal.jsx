import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CenteredModal = ({ isConfirmModalOpen, setIsConfirmModalOpen, targetPath, title }) => {
  const [open, setOpen] = useState(isConfirmModalOpen);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirm = () => {
    if(targetPath.includes('stafflogin')) {
        document.cookie.split(";").forEach(cookie => {
            document.cookie = cookie
              .replace(/^ +/, "")
              .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/;secure;samesite=strict`);
          });
        
          // Clear local storage and session storage
          localStorage.clear();
          sessionStorage.clear();
    }
    navigate(targetPath); // Navigate to the requested page
    setIsConfirmModalOpen(false); // Close the modal
  };

  return (
    <>
      <Dialog
        open={isConfirmModalOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Center the modal
            borderRadius: '10px',
          },
        }}
      >
        <DialogTitle align="center">
          <Typography variant="h6" fontWeight="bold" color='#00296B'>
            Are you sure you want to go to { title }?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center">
            You'll lose course creation progress!!!
          </Typography>
        </DialogContent>
        <DialogActions align="center">
          <Button onClick={handleConfirm} sx={{
            backgroundColor: '#eab308',
            color:"#00296B",
            fontWeight: "bold"
          }}>
            Yes
          </Button>
          <Button onClick={handleClose} color="" sx={{
            backgroundColor: '#00296B',
            color:"white",
            fontWeight: "bold"
          }}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CenteredModal;
