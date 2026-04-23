// frontend/src/components/UserAvatar.jsx

import { Box, Text, Group } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

export default function UserAvatar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Group gap="xs" align="center" style={{ flexShrink: 0 }}>
      {/* Initials circle */}
      <Box
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#00b4d8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <Text size="xs" fw={700} c="white" style={{ letterSpacing: 0.5 }}>
          {user.initials}
        </Text>
      </Box>

      {/* Label */}
      <Box>
        <Text size="xs" c="gray.5" style={{ lineHeight: 1.2 }}>
          Logged in as
        </Text>
        <Text size="xs" fw={600} c="gray.8" style={{ lineHeight: 1.2 }}>
          {user.email}
        </Text>
      </Box>
    </Group>
  );
}