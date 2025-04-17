import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Block as BlockIcon, CheckCircle as ActiveIcon } from '@mui/icons-material';
import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';

const GET_EMPLOYEES = gql`
  query GetEmployees {
    getEmployees {
      id
      email
      firstName
      lastName
      isActive
      createdAt
    }
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: UserInput!) {
    createEmployee(input: $input) {
      id
      email
      firstName
      lastName
      isActive
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: UserInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      isActive
    }
  }
`;

const TOGGLE_EMPLOYEE_STATUS = gql`
  mutation ToggleEmployeeStatus($id: ID!) {
    toggleEmployeeStatus(id: $id) {
      id
      isActive
    }
  }
`;

const AdminEmployeeManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');

  const { loading, error: queryError, data, refetch } = useQuery(GET_EMPLOYEES);

  const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
    onCompleted: () => {
      handleCloseDialog();
      refetch();
      toast.success('Employee created successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to create employee');
    }
  });

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      handleCloseDialog();
      refetch();
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to update employee');
    }
  });

  const [toggleEmployeeStatus] = useMutation(TOGGLE_EMPLOYEE_STATUS, {
    onCompleted: (data) => {
      refetch();
      toast.success(`Employee ${data.toggleEmployeeStatus.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      toast.error('Failed to update employee status');
    }
  });

  const handleOpenDialog = (employee = null) => {
    setSelectedEmployee(employee);
    if (employee) {
      setFormData({
        email: employee.email,
        password: '',
        firstName: employee.firstName,
        lastName: employee.lastName
      });
    } else {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const input = {
      ...formData,
      role: 'employee'
    };

    try {
      if (selectedEmployee) {
        // Update existing employee
        await updateEmployee({
          variables: {
            id: selectedEmployee.id,
            input: {
              ...input,
              // Don't send password if it's empty (no password change)
              ...(formData.password ? { password: formData.password } : {})
            }
          }
        });
      } else {
        // Create new employee
        await createEmployee({
          variables: { input }
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleEmployeeStatus({
        variables: { id }
      });
    } catch (err) {
      toast.error('Failed to toggle employee status');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box p={3}>
        <Alert severity="error">Error loading employees</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employee Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Employee
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.getEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.isActive ? 'Active' : 'Inactive'}
                    color={employee.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(employee.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(employee)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color={employee.isActive ? 'error' : 'success'}
                    onClick={() => handleToggleStatus(employee.id)}
                    size="small"
                  >
                    {employee.isActive ? <BlockIcon /> : <ActiveIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={!selectedEmployee}
              helperText={selectedEmployee ? "Leave blank to keep current password" : ""}
            />
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedEmployee ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminEmployeeManagement; 