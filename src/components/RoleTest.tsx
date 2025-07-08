import { canAccessAdmin, getRoleName } from '@/models/roles';
import { Alert, Box, Chip, Typography } from '@mui/material';
import React from 'react';

interface RoleTestProps {
  roleId: string;
}

export const RoleTest: React.FC<RoleTestProps> = ({ roleId }) => {
  const roleName = getRoleName(roleId);
  const isAdmin = canAccessAdmin(roleId);

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Role Validation Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Role ID:</strong> {roleId}
        </Typography>
        <Typography variant="body1">
          <strong>Role Name:</strong> {roleName || 'Unknown'}
        </Typography>
        <Chip 
          label={isAdmin ? 'Admin Access' : 'No Admin Access'} 
          color={isAdmin ? 'success' : 'error'}
          sx={{ mt: 1 }}
        />
      </Box>

      {!isAdmin && (
        <Alert severity="warning">
          This user cannot access the admin system. Only administrators (role ID: 1) are allowed.
        </Alert>
      )}

      {isAdmin && (
        <Alert severity="success">
          This user has admin access and can use the system.
        </Alert>
      )}
    </Box>
  );
}; 