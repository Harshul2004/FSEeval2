import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const GET_ME = gql`
  query {
    me {
      id
      firstName
      lastName
      email
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required')
});

const Profile = () => {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_ME);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await updateProfile({
          variables: {
            id: user.id,
            input: {
              ...values,
              password: '', // Keep existing password
              role: user.role
            }
          }
        });
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to update profile');
      }
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error">Failed to fetch profile</Alert>
      </Box>
    );
  }

  if (data?.me) {
    formik.setValues({
      firstName: data.me.firstName,
      lastName: data.me.lastName,
      email: data.me.email
    });
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="lastName"
            name="lastName"
            label="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{ mb: 2 }}
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
          >
            Update Profile
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 