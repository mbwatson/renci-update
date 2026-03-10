// frontend/src/components/form-blocks/CurrentDataModal.jsx

import { Modal, Stack, Box, Text } from '@mantine/core';

/**
 * CurrentDataModal
 * Shared modal for displaying current entity data before making changes.
 * Used by UpdateProjectForm and UpdatePersonForm.
 *
 * Each field in the `fields` array is rendered as a label/value row.
 * Null, undefined, and empty string values render as "—".
 *
 * Usage:
 *   <CurrentDataModal
 *     opened={modalOpen}
 *     onClose={() => setModalOpen(false)}
 *     title="Current data: My Project"
 *     fields={[
 *       { label: 'Name', value: project.name },
 *       { label: 'Active', value: project.active ? 'Yes' : 'No' },
 *     ]}
 *   />
 */
export default function CurrentDataModal({ opened, onClose, title, fields = [] }) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg">
      <Stack gap="sm">
        {fields.map(({ label, value }) => (
          <Box key={label}>
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" lts={0.5}>
              {label}
            </Text>
            <Text size="sm">{value || '—'}</Text>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
}