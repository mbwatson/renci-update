// frontend/src/components/forms/ArchiveProjectForm.jsx

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Stack, Text, Button, Alert, Box, Paper } from '@mantine/core';
import { IconAlertTriangle, IconExternalLink } from '@tabler/icons-react';
import { AutocompleteField, ReadOnlyField, LongTextInput, TextInput } from '../fields';
import SubmitterEmailField from '../form-components/SubmitterEmailField';
import SlugConfirmation from '../form-components/SlugConfirmation';
import ArchiveConfirmation from '../form-components/ArchiveConfirmation';
import FormSuccessState from '../form-components/FormSuccessState';

import { useProjects } from '../../hooks/useProjects';

export default function ArchiveProjectForm() {
  const [confirming, setConfirming] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { projects = [], loading, error: projectsError } = useProjects();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      submitterEmail: '',
      project: null,
      reason: '',
    },
  });

  const selectedProject = watch('project');

  async function onSubmit(data) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/projects/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitterEmail: data.submitterEmail,
          slug: data.project?.slug,
          name: data.project?.name,
          reason: data.reason,
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
        entityName={selectedProject?.name}
        entityType="project"
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
          Archive Project
        </Text>

        <Stack gap="xs">
          {projectsError ? (
            <Alert color="red">Could not load projects. Make sure you are connected to the VPN.</Alert>
          ) : (
            <Controller
              name="project"
              control={control}
              rules={{ required: 'Please select a project.' }}
              render={({ field }) => (
                <AutocompleteField
                  {...field}
                  label="Project"
                  required
                  data={projects}
                  error={errors.project?.message}
                />
              )}
            />
          )}
          <SlugConfirmation
            slug={selectedProject?.slug}
            href={`https://renci.org/projects/${selectedProject?.slug}`}
            linkText="View Project Page"
          />
        </Stack>

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
              helperText="Briefly describe why this project should be archived."
            />
          )}
        />

        <Paper radius="md" p="md" style={{ background: '#fff8f0', border: '1px solid #f59e0b' }}>
          <Text size="xs" c="dimmed">
            Archiving a project sets it to inactive. The project page remains publicly
            accessible but will no longer appear in active project listings.
            The implementing team will review this request before making any changes.
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