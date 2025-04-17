import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';

const REGISTER_MUTATION = gql`
  mutation Register($input: UserInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        role
        firstName
        lastName
      }
    }
  }
`;

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name should be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name should be at least 2 characters'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Submitting registration:', values); // Debug log
        const { data } = await registerMutation({
          variables: {
            input: {
              email: values.email,
              password: values.password,
              firstName: values.firstName,
              lastName: values.lastName,
              role: 'customer'
            }
          }
        });

        console.log('Mutation response:', data); // Debug log
        if (data?.register) {
          toast.success('Registration successful! Please login.');
          localStorage.setItem('token', data.register.token); // Store token
          navigate('/auth/login');
        } else {
          throw new Error('Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error.message); // Debug log
        setError(error.message);
        toast.error(error.message);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="firstName"
        label="First Name"
        name="firstName"
        autoComplete="given-name"
        value={formik.values.firstName}
        onChange={formik.handleChange}
        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
        helperText={formik.touched.firstName && formik.errors.firstName}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="lastName"
        label="Last Name"
        name="lastName"
        autoComplete="family-name"
        value={formik.values.lastName}
        onChange={formik.handleChange}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
        helperText={formik.touched.lastName && formik.errors.lastName}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Register
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link href="/auth/login" variant="body2">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;