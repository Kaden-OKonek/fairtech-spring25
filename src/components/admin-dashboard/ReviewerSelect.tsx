import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Avatar,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { User } from 'lucide-react';
import { usersService } from '../../services/users.service';

interface ReviewerSelectProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  excludeUserIds?: string[];
  label?: string;
}

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const ReviewerSelect: React.FC<ReviewerSelectProps> = ({
  value,
  onChange,
  excludeUserIds = [],
  label = 'Select Admin Reviewer',
}) => {
  const [options, setOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        // Get only admin users
        const admins = await usersService.getUsersByRoleAndStatus(
          'admin',
          'active'
        );

        const filteredAdmins = admins
          .filter((admin) => !excludeUserIds.includes(admin.id))
          .map((admin) => ({
            id: admin.id,
            firstName: admin.firstName || '',
            lastName: admin.lastName || '',
            email: admin.email,
          }));

        setOptions(filteredAdmins);
      } catch (error) {
        console.error('Error loading admin users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, [excludeUserIds]);

  const selectedUser = options.find((option) => option.id === value) || null;

  const handleChange = (_: any, newValue: UserOption | null) => {
    onChange(newValue?.id || null);
  };

  const getOptionLabel = (option: UserOption) => {
    return `${option.firstName} ${option.lastName} (${option.email})`;
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: UserOption
  ) => (
    <li {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <User size={16} />
        </Avatar>
        <Box>
          <Typography variant="body1">
            {option.firstName} {option.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {option.email}
          </Typography>
        </Box>
        <Chip label="Admin" size="small" color="primary" sx={{ ml: 'auto' }} />
      </Box>
    </li>
  );

  const renderInput = (params: any) => (
    <TextField
      {...params}
      label={label}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loading && <CircularProgress size={20} />}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  );

  return (
    <Autocomplete
      value={selectedUser}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={renderInput}
      loading={loading}
      fullWidth
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default ReviewerSelect;
