// frontend/src/components/form-components/ArchiveConfirmation.jsx

import { Stack, Text, Button, Alert, Box } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

/**
 * ArchiveConfirmation
 * Inline confirmation step shared by ArchiveProjectForm and ArchivePersonForm.
 * Replaces the main form view; user must confirm or go back before submitting.
 *
 * Usage:
 *   <ArchiveConfirmation
 *     entityName={selectedProject.name}
 *     entityType="project"
 *     onConfirm={handleSubmit(onSubmit)}
 *     onBack={() => { setConfirming(false); setSubmitError(null); }}
 *     loading={isSubmitting}
 *     error={submitError}
 *   />
 */
export default function ArchiveConfirmation({
  entityName,
  entityType = 'item',
  onConfirm,
  onBack,
  loading,
  error,
}) {
  const effectText = entityType === 'person'
    ? 'Their profile page will be set to draft and will no longer be publicly accessible.'
    : 'The project page will remain publicly accessible but will drop off active project listings.';

  return (
    <Stack gap="lg">
      <Alert
        icon={<IconAlertTriangle size={16} />}
        color="orange"
        radius="md"
        title="Confirm archive request"
      >
        <Text size="sm">
          Are you sure you want to request archiving{' '}
          <strong>{entityName}</strong>? {effectText} The implementing team
          will review before any changes are made.
        </Text>
      </Alert>

      {error && (
        <Alert color="red" radius="md" title="Submission error">
          <Text size="sm">{error}</Text>
        </Alert>
      )}

      <Box style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <Button
          variant="subtle"
          color="gray"
          onClick={onBack}
          disabled={loading}
        >
          Go back
        </Button>
        <Button
          color="orange"
          loading={loading}
          onClick={onConfirm}
        >
          Yes, submit request
        </Button>
      </Box>
    </Stack>
  );
}