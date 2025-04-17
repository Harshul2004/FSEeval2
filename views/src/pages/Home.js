import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Welcome to Our Store
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Discover amazing products at great prices. Shop now and enjoy the best shopping experience.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            Shop Now
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/auth/login')}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 