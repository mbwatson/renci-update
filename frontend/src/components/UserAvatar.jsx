// frontend/src/components/UserAvatar.jsx

import { Box, Text, Group, Menu } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

export default function UserAvatar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Menu position="bottom-end" offset={8} withArrow>
      <Menu.Target>
        <Group
          gap="xs"
          align="center"
          style={{ flexShrink: 0, cursor: 'pointer' }}
        >
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
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{user.name}</Menu.Label>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          onClick={logout}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}