// src/components/Layout/Navbar.tsx
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
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
            <Button color="inherit" component={RouterLink} to="/gigs">
              Home
            </Button>
            {isAuthenticated && (
              <Button color="inherit" component={RouterLink} to="/chat">
                Chat
              </Button>
            )}
            {isAuthenticated && (
              <Button color="inherit" component={RouterLink} to="/gigs/new">
                Post Job
              </Button>
            )}
            {isAuthenticated && (
              <Button color="inherit" component={RouterLink} to="/profile">
                Profile
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;