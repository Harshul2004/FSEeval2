import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const LOGIN_MUTATION = gql`
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

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

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
      const { data } = await loginMutation({
        variables: {
          email: formData.email,
          password: formData.password
        }
      });

      if (data?.login) {
        const userRole = data.login.user.role;
        
        // Verify role matches selected login type
        if (selectedRole && userRole !== selectedRole) {
          setError(`Invalid credentials for ${selectedRole} login`);
          return;
        }

        await authLogin(formData.email, formData.password);
        
        // Redirect based on role
        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'employee':
            navigate('/employee/orders');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  if (!selectedRole) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          pt: 8
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Please select your login type
        </Typography>
        
        <Grid container spacing={3} maxWidth="md" sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Customer
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Shop and manage your orders
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => handleRoleSelect('customer')}
                >
                  Login as Customer
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Employee
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage orders and inventory
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="secondary"
                  onClick={() => handleRoleSelect('employee')}
                >
                  Login as Employee
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Admin
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Full system administration
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="error"
                  onClick={() => handleRoleSelect('admin')}
                >
                  Login as Admin
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

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
          {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login
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
            color={selectedRole === 'admin' ? 'error' : selectedRole === 'employee' ? 'secondary' : 'primary'}
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          {selectedRole === 'customer' ? (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Button
                  component={Link}
                  to="/auth/register"
                  color="primary"
                  sx={{ textTransform: 'none' }}
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                {selectedRole === 'employee' 
                  ? 'Employee accounts are created by administrators. Please contact your admin for access.'
                  : 'Admin accounts are managed internally. Please contact the system administrator.'}
              </Typography>
            </Box>
          )}
          
          <Button
            fullWidth
            variant="text"
            onClick={() => setSelectedRole(null)}
            sx={{ mt: 2 }}
          >
            Back to Selection
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage; 