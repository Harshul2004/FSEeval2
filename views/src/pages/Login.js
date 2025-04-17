import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Submitting login:', values); // Debug log
        const result = await login(values.email, values.password);
        console.log('Login result:', result); // Debug log
        if (result.success) {
          toast.success('Login successful!');
          navigate('/');
        } else {
          setError(result.error || 'Login failed');
        }
      } catch (err) {
        console.error('Login error:', err.message); // Debug log
        setError('An error occurred during login');
      }
    }
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Login to Your Account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        sx={{ mb: 2 }}
      />

      <Button
        color="primary"
        variant="contained"
        fullWidth
        type="submit"
        sx={{ mb: 2 }}
      >
        Login
      </Button>

      <Typography variant="body2" align="center">
        Don't have an account?{' '}
        <Link component={RouterLink} to="/auth/register">
          Register here
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;