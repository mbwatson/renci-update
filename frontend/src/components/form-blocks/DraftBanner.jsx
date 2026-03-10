// frontend/src/components/form-blocks/DraftBanner.jsx
import { Alert, Group, Button, Text } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';

/**
 * DraftBanner
 * Shown at the top of a form page when a saved draft exists.
 * Offers Resume (populate form from draft) or Discard (clear and start fresh).
 *
 * Usage:
 *   {draft && (
 *     <DraftBanner
 *       savedAt={draft.savedAt}
 *       onResume={resumeDraft}
 *       onDiscard={discardDraft}
 *     />
 *   )}
 */
function timeAgo(savedAt) {
  const diffMs = Date.now() - savedAt;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return 'more than a day ago';
}

export default function DraftBanner({ savedAt, onResume, onDiscard }) {
  return (
    <Alert
      icon={<IconDeviceFloppy size={16} />}
      color="blue"
      radius="md"
      variant="light"
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text size="sm">
          You have a saved draft on this device from{' '}
          <strong>{timeAgo(savedAt)}</strong>.
        </Text>
        <Group gap="xs" wrap="nowrap">
          <Button size="xs" variant="subtle" color="gray" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="xs" variant="light" color="blue" onClick={onResume}>
            Resume
          </Button>
        </Group>
      </Group>
    </Alert>
  );
}