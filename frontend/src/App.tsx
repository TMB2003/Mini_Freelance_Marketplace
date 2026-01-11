import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout/Layout'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('auth-changed', updateAuth);
    window.addEventListener('storage', updateAuth);
    return () => {
      window.removeEventListener('auth-changed', updateAuth);
      window.removeEventListener('storage', updateAuth);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
            />
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            {/* Add more protected routes here */}
          </Route>
        </Routes>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;