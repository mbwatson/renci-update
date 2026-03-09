// frontend/src/components/form-components/FormSuccessState.jsx

import { Stack, Text, Button } from '@mantine/core';

/**
 * FormSuccessState
 * Shared success view shown after a form is successfully submitted.
 * Replaces the form content entirely until the user chooses to submit again.
 *
 * Usage:
 *   <FormSuccessState
 *     onReset={() => setSubmitSuccess(false)}
 *     message="Your request has been submitted. Check your email for a confirmation from the team."
 *   />
 */
export default function FormSuccessState({ onReset, message }) {
  return (
    <Stack gap="md" align="center" py="xl">
      <Text size="sm" fw={600} c="#005b8e">
        Request submitted
      </Text>
      <Text size="sm" c="dimmed" ta="center">
        {message ?? "Your request has been submitted. Check your email for a confirmation from the team."}
      </Text>
      <Button variant="subtle" size="xs" onClick={onReset}>
        Submit another request
      </Button>
    </Stack>
  );
}