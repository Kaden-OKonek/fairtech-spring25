import React from 'react';
import { Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

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
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
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
    <Button variant={variant} color={color} size={size} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
