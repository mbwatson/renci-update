// frontend/src/components/Header.jsx

import { Box, Group, Text, Container, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

export default function Header() {
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
      }}
    >
      {/* Two-tone top accent rule */}
      <Box style={{ display: 'flex', height: 4 }}>
        <Box style={{ flex: 2, background: '#005b8e' }} />
        <Box style={{ flex: 1, background: '#00b4d8' }} />
      </Box>

      <Container size="sm" py="sm">
        <Group justify="space-between" align="center">

          {/* Branding */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: '#005b8e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <Text size="xs" fw={800} c="white" style={{ letterSpacing: 1 }}>
                R
              </Text>
            </Box>
            <Box>
              <Text
                size="sm"
                fw={700}
                c="#005b8e"
                style={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}
              >
                RENCI
              </Text>
              <Text size="xs" c="gray.7" style={{ lineHeight: 1.2 }}>
                Website Change Requests
              </Text>
            </Box>
          </Box>

          {/* Right side: New Request + avatar */}
          <Group gap="md" align="center">
            <Button
              variant="filled"
              size="xs"
              onClick={() => navigate('/')}
              style={{ flexShrink: 0, background: '#005b8e' }}
            >
              New Request
            </Button>
            <UserAvatar />
          </Group>

        </Group>
      </Container>
    </Box>
  );
}