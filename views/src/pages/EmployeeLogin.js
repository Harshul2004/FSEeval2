import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const EMPLOYEE_LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(EMPLOYEE_LOGIN, {
    onCompleted: (data) => {
      if (data.login.user.role !== 'employee') {
        setError('Access denied. Employee accounts only.');
        return;
      }
      authLogin(data.login.token, data.login.user);
      toast.success('Login successful!');
      navigate('/employee/orders');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Login failed: ' + error.message);
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginMutation({
        variables: {
          email: formData.email,
          password: formData.password
        }
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Employee Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EmployeeLogin; 