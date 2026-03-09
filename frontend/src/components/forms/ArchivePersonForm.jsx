// frontend/src/components/forms/ArchivePersonForm.jsx

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Stack, Text, Button, Alert, Box, Paper } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { AutocompleteField, ReadOnlyField, LongTextInput, TextInput } from '../fields';
import SubmitterEmailField from '../form-components/SubmitterEmailField';
import SlugConfirmation from '../form-components/SlugConfirmation';
import ArchiveConfirmation from '../form-components/ArchiveConfirmation';
import FormSuccessState from '../form-components/FormSuccessState';

import { usePeople } from '../../hooks/usePeople';

export default function ArchivePersonForm() {
  const [confirming, setConfirming] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { people = [], loading, error: peopleError } = usePeople();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      submitterEmail: '',
      person: null,
      effectiveDate: null,
      reason: '',
      additionalContext: '',
    },
  });

  const selectedPerson = watch('person');

  async function onSubmit(data) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/people/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitterEmail: data.submitterEmail,
          slug: data.person?.slug,
          effectiveDate: data.effectiveDate
            ? data.effectiveDate.toISOString().slice(0, 10)
            : null,
          reason: data.reason,
          additionalContext: data.additionalContext || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.code === 'VPN_REQUIRED') {
          setSubmitError('This app requires a VPN connection to submit. Please connect and try again.');
        } else if (Array.isArray(body.errors)) {
          setSubmitError(body.errors.map((e) => e.message).join(' '));
        } else {
          setSubmitError(body.message || 'Something went wrong. Please try again.');
        }
        return;
      }

      setSubmitted(true);
      reset();
      setConfirming(false);
    } catch {
      setSubmitError('Could not reach the server. Check your connection and try again.');
    }
  }

  if (submitted) {
    return <FormSuccessState onReset={() => setSubmitted(false)} />;
  }

  if (confirming) {
    return (
      <ArchiveConfirmation
        entityName={selectedPerson?.name}
        entityType="person"
        onConfirm={handleSubmit(onSubmit)}
        onBack={() => { setConfirming(false); setSubmitError(null); }}
        loading={isSubmitting}
        error={submitError}
      />
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => setConfirming(true))(); }}>
      <Stack gap="lg">

        <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Archive Person
        </Text>

        <Stack gap="xs">
          {peopleError ? (
            <Alert color="red">Could not load people. Make sure you are connected to the VPN.</Alert>
          ) : (
            <Controller
              name="person"
              control={control}
              rules={{ required: 'Please select a person.' }}
              render={({ field }) => (
                <AutocompleteField
                  {...field}
                  label="Person"
                  required
                  data={people}
                  error={errors.person?.message}
                />
              )}
            />
          )}
          <SlugConfirmation
            slug={selectedPerson?.slug}
            href={`https://renci.org/team/${selectedPerson?.slug}`}
            linkText="View Profile"
          />
        </Stack>

        <Controller
          name="effectiveDate"
          control={control}
          rules={{ required: 'Effective date is required.' }}
          render={({ field }) => (
            <DateInput
              {...field}
              label="Effective Date"
              required
              clearable
              placeholder="Pick a date"
              helperText="Last day / date the archival takes effect."
              error={errors.effectiveDate?.message}
              styles={{ label: { fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 } }}
            />
          )}
        />

        <Controller
          name="reason"
          control={control}
          rules={{ required: 'Please provide a reason for archiving.' }}
          render={({ field }) => (
            <LongTextInput
              {...field}
              label="Reason for archiving"
              required
              error={errors.reason?.message}
              helperText="Briefly describe why this person's profile should be archived."
            />
          )}
        />

        <Controller
          name="additionalContext"
          control={control}
          render={({ field }) => (
            <LongTextInput
              {...field}
              label="Additional context, if any"
              error={errors.additionalContext?.message}
            />
          )}
        />

        <Paper radius="md" p="md" style={{ background: '#fff8f0', border: '1px solid #f59e0b' }}>
          <Text size="xs" c="dimmed">
            Archiving a person sets their profile to inactive. Their profile page will no longer
            be publicly accessible. The implementing team will review this request before making
            any changes.
          </Text>
        </Paper>

        <SubmitterEmailField control={control} error={errors.submitterEmail?.message} />

        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" color="orange">
            Review &amp; confirm
          </Button>
        </Box>

      </Stack>
    </form>
  );
}