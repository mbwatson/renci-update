// frontend/src/components/form-components/SubmitterEmailField.jsx

import { Controller } from 'react-hook-form';
import TextInput from '../fields/TextInput';

/**
 * SubmitterEmailField
 * Shared submitter email field used across all six forms.
 * Always placed last, immediately above the submit button.
 *
 * Usage:
 *   <SubmitterEmailField control={control} error={errors.submitterEmail?.message} />
 */
export default function SubmitterEmailField({ control, error }) {
  return (
    <Controller
      name="submitterEmail"
      control={control}
      rules={{
        required: 'Your email is required.',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Enter a valid email address.',
        },
      }}
      render={({ field }) => (
        <TextInput
          {...field}
          label="Your Email"
          required
          helperText="Used for Monday.com ticket notifications. Not stored in WordPress."
          error={error}
        />
      )}
    />
  );
}