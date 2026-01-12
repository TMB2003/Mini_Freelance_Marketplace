// src/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, register as registerService } from '../services/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await loginService({ email, password });
      localStorage.setItem('token', token);
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/gigs', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await registerService({ name, email, password });
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login');
  };

  return { login, register, logout, loading, error };
};