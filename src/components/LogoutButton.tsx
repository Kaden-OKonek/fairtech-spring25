import React from 'react';
import { Button } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

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
  onClick?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  showIcon = true,
  onClick,
}) => {
  const { logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      onClick?.();
      // AccessGuard will handle navigation
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
