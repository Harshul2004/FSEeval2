import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation, gql } from '@apollo/client';
import client from '../apollo/client';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
        firstName
        lastName
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext mount - Token:', token); // Debug log
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext mount - Parsed User:', parsedUser); // Debug log
        setUser(parsedUser); // Set user from localStorage immediately
      }
    }
    setLoading(false); // Set loading false after initial check
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', { email, password });
      const { data } = await loginMutation({ variables: { email, password } });
      console.log('Login response:', data);
      if (data?.login) {
        const { token, user } = data.login;
        console.log('Storing token:', token);
        console.log('Storing user:', user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success('Login successful!');
        navigate('/');
        return { success: true };
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Register attempt:', userData);
      const { data } = await registerMutation({
        variables: {
          input: {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
          }
        }
      });
      console.log('Register response:', data);
      if (data?.register) {
        localStorage.setItem('token', data.register.token);
        const registeredUser = {
          ...data.register.user,
          id: data.register.user.id
        };
        setUser(registeredUser);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        toast.success('Registration successful!');
        navigate('/');
        return { success: true };
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Register error:', error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;