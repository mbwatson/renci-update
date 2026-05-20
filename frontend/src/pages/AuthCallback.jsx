// frontend/src/pages/AuthCallback.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { Box, Loader, Text, Stack, Button, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function AuthCallback() {
  const oidc = useOidcAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!oidc.isLoading && oidc.user) {
      navigate('/', { replace: true });
    }
  }, [oidc.isLoading, oidc.user, navigate]);

  if (oidc.error) {
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
        <Stack align="center" gap="md" style={{ maxWidth: 400, width: '100%', padding: '0 1rem' }}>
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Sign in failed"
            w="100%"
          >
            Something went wrong during sign in. Please try again.
          </Alert>
          <Button
            onClick={() => navigate('/login', { replace: true })}
            style={{ background: '#005b8e' }}
          >
            Back to sign in
          </Button>
        </Stack>
      </Box>
    );
  }

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