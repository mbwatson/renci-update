// frontend/src/pages/LoginPage.jsx

import { Box, Button, Text, Stack, Divider, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin() {
    login();
    navigate('/');
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container size={400} w="100%">
        <Box
          style={{
            background: '#fff',
            border: '1px solid #e8e8e8',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {/* Two-tone accent rule — matches the header */}
          <Box style={{ display: 'flex', height: 4 }}>
            <Box style={{ flex: 2, background: '#005b8e' }} />
            <Box style={{ flex: 1, background: '#00b4d8' }} />
          </Box>

          <Stack gap="lg" p="xl">
            {/* Branding */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: '#005b8e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <Text size="sm" fw={800} c="white" style={{ letterSpacing: 1 }}>
                  R
                </Text>
              </Box>
              <Box>
                <Text fw={700} c="#005b8e" style={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  RENCI
                </Text>
                <Text size="xs" c="gray.7" style={{ lineHeight: 1.2 }}>
                  Website Change Requests
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* Description */}
            <Stack gap="xs">
              <Text fw={600} size="sm">
                Staff access only
              </Text>
              <Text size="sm" c="gray.7">
                This tool is for RENCI staff to submit website content change requests —
                adding, updating, or archiving projects and people.
              </Text>
            </Stack>

            {/* SSO trigger */}
            <Button
              fullWidth
              size="sm"
              onClick={handleLogin}
              style={{ background: '#005b8e' }}
            >
              Sign in with your organization account
            </Button>
          </Stack>
        </Box>

        <Text size="xs" c="gray.5" ta="center" mt="md">
          RENCI · Renaissance Computing Institute
        </Text>
      </Container>
    </Box>
  );
}