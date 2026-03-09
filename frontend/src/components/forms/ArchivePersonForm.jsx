// frontend/src/components/forms/ArchivePersonForm.jsx

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Stack, Text, Button, Alert, Box, Paper } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertTriangle, IconExternalLink } from '@tabler/icons-react';
import { AutocompleteField, ReadOnlyField, LongTextInput, TextInput } from '../fields';

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
      person: null,       // { name, slug, id }
      effectiveDate: null,
      reason: '',
      additionalContext: '',
    },
  });

  const selectedPerson = watch('person');

  // ── Submission ─────────────────────────────────────────────────────────────
  async function onSubmit(data) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/people/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitterEmail: data.submitterEmail,
          slug: data.person?.slug,
          name: data.person?.name,
          effectiveDate: data.effectiveDate
            ? data.effectiveDate.toISOString().split('T')[0]
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

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Stack gap="md" align="center" py="xl">
        <Text size="sm" fw={600} c="#005b8e">Request submitted</Text>
        <Text size="sm" c="dimmed" ta="center">
          Your archive request has been received. Check your email for a confirmation from Monday.com.
        </Text>
        <Button variant="subtle" size="xs" onClick={() => setSubmitted(false)}>
          Submit another request
        </Button>
      </Stack>
    );
  }

  // ── Confirmation step ──────────────────────────────────────────────────────
  if (confirming) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            radius="md"
            title="Confirm archive request"
          >
            <Text size="sm">
              Are you sure you want to request archiving{' '}
              <strong>{selectedPerson?.name}</strong>? Their profile page will be set to draft
              and will no longer be publicly accessible. The implementing team will review
              before any changes are made.
            </Text>
          </Alert>

          {submitError && (
            <Alert color="red" radius="md" title="Submission error">
              <Text size="sm">{submitError}</Text>
            </Alert>
          )}

          <Box style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="subtle"
              color="gray"
              onClick={() => { setConfirming(false); setSubmitError(null); }}
              disabled={isSubmitting}
            >
              Go back
            </Button>
            <Button
              type="submit"
              color="orange"
              loading={isSubmitting}
            >
              Yes, submit request
            </Button>
          </Box>
        </Stack>
      </form>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => setConfirming(true))(); }}>
      <Stack gap="lg">

        <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Archive Person
        </Text>

        {/* Person identification */}
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

          {selectedPerson?.slug && (
            <Stack gap={4}>
              <ReadOnlyField label="Slug" value={selectedPerson.slug} />
              <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Text
                  component="a"
                  href={`https://renci.org/team/${selectedPerson.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  size="xs"
                  c="#005b8e"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  View Profile
                  <IconExternalLink size={12} />
                </Text>
              </Box>
            </Stack>
          )}
        </Stack>

        {/* Effective date */}
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
              description="Last day / date the archival takes effect."
              error={errors.effectiveDate?.message}
              styles={{
                label: { fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 },
              }}
            />
          )}
        />

        {/* Reason */}
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

        {/* Submitter email */}
        <Controller
          name="submitterEmail"
          control={control}
          rules={{
            required: 'Your email is required.',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
          }}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Your Email"
              required
              error={errors.submitterEmail?.message}
              helperText="Used for Monday.com ticket notifications."
            />
          )}
        />

        {/* Warning callout */}
        <Paper radius="md" p="md" style={{ background: '#fff8f0', border: '1px solid #f59e0b' }}>
          <Text size="xs" c="dimmed">
            Archiving a person sets their profile to inactive. Their profile page will be set to
            draft and will no longer be publicly accessible. The implementing team will review
            this request before making any changes.
          </Text>
        </Paper>

        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" color="orange">
            Review &amp; confirm
          </Button>
        </Box>

      </Stack>
    </form>
  );
}