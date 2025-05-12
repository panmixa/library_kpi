import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear secret key error when user types in the field
    if (name === 'secretKey') {
      setSecretKeyError('');
    }
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value as 'USER' | 'ADMIN',
    }));

    // Clear secret key error when changing role
    setSecretKeyError('');
  };

  const validateAdminSecretKey = (): boolean => {
    // This should be a strong validation algorithm in a real application
    // For demonstration purposes, we're using a simple check
    const correctSecretKey = 'admin123'; // In real app, this would not be hardcoded

    if (formData.role === 'ADMIN' && formData.secretKey !== correctSecretKey) {
      setSecretKeyError('Invalid secret key for admin registration');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate secret key for admin role
    if (formData.role === 'ADMIN' && !validateAdminSecretKey()) {
      return;
    }

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'USER' | 'ADMIN',
        ...(formData.role === 'ADMIN' && { secretKey: formData.secretKey })
      });
      
      // Оновлюємо інформацію в AuthContext
      if (response.token) {
        const userData = authService.getUser();
        if (userData) {
          login(userData);
        }
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Register
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
              />
              <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
              />
              <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
              />
              <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  margin="normal"
                  required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleRoleChange}
                    required
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>

              {formData.role === 'ADMIN' && (
                  <TextField
                      fullWidth
                      label="Admin Secret Key"
                      name="secretKey"
                      type="password"
                      value={formData.secretKey}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      error={!!secretKeyError}
                      helperText={secretKeyError}
                  />
              )}

              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, mb: 2 }}
              >
                Register
              </Button>
              <Typography align="center">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Login
                </Link>
              </Typography>
            </form>
          </Paper>
        </Box>
      </Container>
  );
};

export default Register;
