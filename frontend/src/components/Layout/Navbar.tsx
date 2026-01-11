// src/components/Layout/Navbar.tsx
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const onAuthPages = location.pathname === '/login' || location.pathname === '/register';

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Freelance Marketplace
          </RouterLink>
        </Typography>
        {!onAuthPages && (
          <Box>
            <Button color="inherit" component={RouterLink} to="/dashboard">
              Dashboard
            </Button>
            {isAuthenticated && (
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;