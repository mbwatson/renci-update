// frontend/src/components/form-blocks/SectionLabel.jsx

import { Text } from '@mantine/core';

/**
 * SectionLabel
 * Small uppercase dimmed label used inside change blocks and relational field panels.
 *
 * Usage:
 *   <SectionLabel>Current contributors</SectionLabel>
 */
export default function SectionLabel({ children }) {
  return (
    <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
      {children}
    </Text>
  );
}