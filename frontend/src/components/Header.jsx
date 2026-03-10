// frontend/src/components/Header.jsx
import { Box, Group, Text, Container } from '@mantine/core';
import { Link } from 'react-router-dom';
// Option A — import from src/assets (Vite processes it):
// import renciLogo from '../assets/renci-logo-simple.png';
// Option B — place file in public/ and reference directly:
// const renciLogo = '/renci-logo-simple.png';

export default function Header() {
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
      {/* Top accent line — two-tone rule */}
      <Box style={{ display: 'flex', height: 4 }}>
        <Box style={{ flex: 2, background: '#005b8e' }} />
        <Box style={{ flex: 1, background: '#00b4d8' }} />
      </Box>

      <Container size="sm" py="sm">
        <Group gap="xs" align="center">
          <Link
            to="/"
            aria-label="RENCI Website Change Requests — return to home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              borderRadius: 6,
              // Ensure focus ring is visible for keyboard users
              outline: 'none',
            }}
            // Mantine's global focus-visible styles will apply,
            // but add an explicit fallback for safety
            onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #005b8e'}
            onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            {/* Swap this block for <img> once logo asset is ready */}
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
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
                Website Change Requests
              </Text>
            </Box>
          </Link>
        </Group>
      </Container>
    </Box>
  );
}