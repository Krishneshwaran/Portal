import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    collegename: '',
    dept: '',
    regno: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/profile/`, {
          withCredentials: true, // Include cookies for authentication
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#000975',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            color: '#000975',
            textAlign: 'center',
          }}
        >
          Student Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profile.name}
              variant="outlined"
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: '#000975', pointerEvents: 'none' },
              }}
              sx={{ pointerEvents: 'none' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profile.email}
              variant="outlined"
              type="email"
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: '#000975', pointerEvents: 'none' },
              }}
              sx={{ pointerEvents: 'none' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={'••••••••'} // Mask the password
              variant="outlined"
              type="password"
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: '#000975', pointerEvents: 'none' },
              }}
              sx={{ pointerEvents: 'none' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="College Name"
              name="collegename"
              value={profile.collegename}
              variant="outlined"
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: '#000975', pointerEvents: 'none' },
              }}
              sx={{ pointerEvents: 'none' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Department"
              name="dept"
              value={profile.dept}
              variant="outlined"
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: '#000975', pointerEvents: 'none' },
              }}
              sx={{ pointerEvents: 'none' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Registration Number"
              name="regno"
              value={profile.regno}
              variant="outlined"
              InputLabelProps={{
                style: { color: 'black' },
              }}
              InputProps={{
                style: { color: '#000975', pointerEvents: 'none' },
              }}
              sx={{ pointerEvents: 'none' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentProfile;
