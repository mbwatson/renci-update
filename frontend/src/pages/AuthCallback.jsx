// frontend/src/pages/AuthCallback.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { Box, Loader, Text, Stack } from '@mantine/core';

export default function AuthCallback() {
  const oidc = useOidcAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!oidc.isLoading && oidc.user) {
      navigate('/', { replace: true });
    }
  }, [oidc.isLoading, oidc.user, navigate]);

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9',
      }}
    >
      <Stack align="center" gap="sm">
        <Loader color="#005b8e" />
        <Text size="sm" c="gray.6">
          Signing you in...
        </Text>
      </Stack>
    </Box>
  );
}