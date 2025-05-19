import React from 'react';
import { Outlet, Navigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            variant="h4"
            sx={{ mb: 4, fontWeight: 'bold', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            E-Commerce Store
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;