// src/components/Layout/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container
        component="main"
        maxWidth={isChatPage ? false : undefined}
        disableGutters={isChatPage}
        sx={{ mt: 4, mb: 4, flex: 1, px: isChatPage ? 2 : undefined }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;