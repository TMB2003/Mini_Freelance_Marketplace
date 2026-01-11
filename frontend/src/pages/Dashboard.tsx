// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

interface User {
  name: string;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Replace with actual API call to get current user
        // const userData = await getCurrentUser();
        // setUser(userData);
        setUser({ name: 'John Doe', email: 'john@example.com' }); // Temporary mock data
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user.name}!
      </Typography>
      <Typography variant="body1" paragraph>
        Email: {user.email}
      </Typography>
    </Box>
  );
};

export default Dashboard;