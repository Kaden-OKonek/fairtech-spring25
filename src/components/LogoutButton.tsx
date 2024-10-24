import React from 'react';
import { Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@mui/icons-material';

interface LogoutButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  showIcon = true,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/'); // Redirect to the login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={handleLogout}
      startIcon={showIcon ? <LogoutOutlined /> : undefined}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
