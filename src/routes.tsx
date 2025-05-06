import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './components/BookList/BookList';
import BookDetails from './pages/BookDetails';
import ReadBook from './pages/ReadBook';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <BookList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:id"
        element={
          <ProtectedRoute>
            <BookDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/read/:id"
        element={
          <ProtectedRoute>
            <ReadBook />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
