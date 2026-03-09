// frontend/src/components/form-components/SlugConfirmation.jsx

import { Stack, Box, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import ReadOnlyField from '../fields/ReadOnlyField';

/**
 * SlugConfirmation
 * Displays a read-only slug field with a right-aligned external link.
 * Used on all Update and Archive forms after a person or project is selected.
 *
 * Usage:
 *   <SlugConfirmation
 *     slug={selectedProject.slug}
 *     href={`https://renci.org/projects/${selectedProject.slug}`}
 *     linkText="View Project Page"
 *   />
 */
export default function SlugConfirmation({ slug, href, linkText }) {
  if (!slug) return null;

  return (
    <Stack gap={4}>
      <ReadOnlyField label="Slug" value={slug} />
      <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Text
          component="a"
          href={href}
          target="_blank"
          rel="noreferrer"
          size="xs"
          c="#005b8e"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {linkText}
          <IconExternalLink size={12} />
        </Text>
      </Box>
    </Stack>
  );
}