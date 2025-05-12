import axios from 'axios';
import { Book } from '../types/book';
import { ReadingProgress } from './ReadingService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token set in request:', token);
  } else {
    console.log('No token found in localStorage');
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getBooks = async (filters?: { author?: string; genre?: string; year?: number }) => {
  try {
    console.log('Fetching books with filters:', filters);
    const response = await api.get('/books', { params: filters });
    console.log('Books response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const getBookById = async (id: string) => {
  try {
    const response = await api.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

export const saveReadingProgress = async (progress: Omit<ReadingProgress, 'id'>) => {
  try {
    const response = await api.post('/reading-progress', progress);
    return response.data;
  } catch (error) {
    console.error('Error saving reading progress:', error);
    throw error;
  }
};

export const getUserReadingProgress = async (userId: string) => {
  try {
    const response = await api.get(`/reading-progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    throw error;
  }
};

export const updateReadingProgress = async (id: string, progress: Partial<ReadingProgress>) => {
  try {
    const response = await api.put(`/reading-progress/${id}`, progress);
    return response.data;
  } catch (error) {
    console.error('Error updating reading progress:', error);
    throw error;
  }
};

// Auth endpoints
export const login = async (credentials: { username: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    localStorage.setItem('auth_token', token);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
};

// Get user profile information
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export default api;
