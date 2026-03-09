// frontend/src/components/forms/AddPersonForm.jsx

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Stack,
  Group,
  Button,
  Select,
  MultiSelect,
  Switch,
  Title,
  Text,
  Alert,
  ActionIcon,
  Divider,
  Paper,
  Collapse,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconTrash, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';

import TextInput from '../fields/TextInput';
import LongTextInput from '../fields/LongTextInput';
import UrlInput from '../fields/UrlInput';
import TagsInput from '../fields/TagsInput';

import { usePeople } from '../../hooks/usePeople';
import { useProjects } from '../../hooks/useProjects';
import { useGroups } from '../../hooks/useGroups';

const REVIEW_ELIGIBLE_FIELDS = ['bio', 'renciScholarBio'];

const GROUP_ACRONYMS = {
  'earth-data-science': 'EDS',
  'networking-research-infrastructure': 'NRIG',
  'acis': 'ACIS',
  'ood': 'OOD',
  'research-project-management': 'RPM',
};

function groupLabel(group) {
  const acronym = GROUP_ACRONYMS[group.slug];
  return acronym ? `${group.name} (${acronym})` : group.name;
}

export default function AddPersonForm() {
  const { projects, loading: projectsLoading } = useProjects();
  const { researchGroups, operationsGroups, loading: groupsLoading } = useGroups();

  const groupOptions = [
    {
      group: 'Research Groups',
      items: (researchGroups || []).map((g) => ({ value: g.slug, label: groupLabel(g) })),
    },
    {
      group: 'Operations Groups',
      items: (operationsGroups || []).map((g) => ({ value: g.slug, label: groupLabel(g) })),
    },
  ];

  const [reviewRequests, setReviewRequests] = useState({});
  const handleReviewChange = (fieldName, checked) => {
    setReviewRequests((prev) => ({ ...prev, [fieldName]: checked }));
  };

  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      submitterEmail: '',
      firstName: '',
      lastName: '',
      preferredName: '',
      jobTitle: '',
      groups: [],
      startDate: null,
      renciScholar: false,
      renciScholarBio: '',
      projects: [],
      bio: '',
      websites: [],
    },
  });

  const { fields: websiteFields, append, remove } = useFieldArray({
    control,
    name: 'websites',
  });

  const renciScholar = watch('renciScholar');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitError('');

    const reviewRequestsList = REVIEW_ELIGIBLE_FIELDS.filter(
      (fieldName) => !!reviewRequests[fieldName]
    );

    // Serialize startDate to ISO string for the backend
    const payload = {
      ...data,
      startDate: data.startDate ? data.startDate.toISOString().split('T')[0] : null,
      reviewRequests: reviewRequestsList,
    };

    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 503) {
        setSubmitError(
          "Unable to reach the data server. Please make sure you're connected to the VPN and try again."
        );
        setSubmitStatus('error');
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message =
          body?.errors?.map((e) => e.message).join(', ') ||
          `Submission failed (${res.status})`;
        setSubmitError(message);
        setSubmitStatus('error');
        return;
      }

      setSubmitStatus('success');
      reset();
      setReviewRequests({});
    } catch {
      setSubmitError(
        "Unable to reach the data server. Please make sure you're connected to the VPN and try again."
      );
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="xl">
      <div>
        <Title order={3}>Add Person</Title>
        <Text c="dimmed" size="sm" mt={4}>
          Submit a request to add a new person to the RENCI website.
        </Text>
      </div>

      {submitStatus === 'success' && (
        <Alert
          icon={<IconCircleCheck size={18} />}
          title="Submission received"
          color="green"
          variant="light"
        >
          Your request has been submitted. You'll receive an email when it's been reviewed.
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Submission failed"
          color="red"
          variant="light"
        >
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="lg">

          {/* ── Submitter email ── */}
          <Controller
            name="submitterEmail"
            control={control}
            rules={{ required: 'Your email address is required.' }}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Your Email"
                required
                helperText="We'll email you when this is reviewed."
                error={errors.submitterEmail?.message}
              />
            )}
          />

          <Divider label="Name" labelPosition="left" />

          {/* ── First + Last name ── */}
          <Group grow align="flex-start">
            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'First name is required.' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="First Name"
                  required
                  error={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              rules={{ required: 'Last name is required.' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Last Name"
                  required
                  error={errors.lastName?.message}
                />
              )}
            />
          </Group>

          {/* ── Preferred name ── */}
          <Controller
            name="preferredName"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Preferred Name"
                helperText="How their name will appear publicly — preferred first name, middle name included or excluded, etc."
                error={errors.preferredName?.message}
              />
            )}
          />

          <Divider label="Role & affiliation" labelPosition="left" />

          {/* ── Job title ── */}
          <Controller
            name="jobTitle"
            control={control}
            rules={{ required: 'Job title is required.' }}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Job Title"
                required
                helperText="Semicolon-separated if multiple titles."
                error={errors.jobTitle?.message}
              />
            )}
          />

          {/* ── Groups ── */}
          <Controller
            name="groups"
            control={control}
            rules={{
              validate: (val) =>
                (Array.isArray(val) && val.length > 0) || 'At least one group is required.',
            }}
            render={({ field }) => (
              <MultiSelect
                {...field}
                label="Groups"
                required
                data={groupOptions}
                placeholder={groupsLoading ? 'Loading groups…' : 'Select groups…'}
                disabled={groupsLoading}
                searchable
                error={errors.groups?.message}
                styles={{
                  label: { fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 },
                  input: { fontSize: '0.9375rem', borderRadius: 6 },
                }}
              />
            )}
          />

          {/* ── Start date ── */}
          <Controller
            name="startDate"
            control={control}
            rules={{ required: 'Start date is required.' }}
            render={({ field }) => (
              <DateInput
                {...field}
                label="Start Date"
                required
                clearable
                placeholder="Pick a date"
                description="The implementing team will not publish this profile before this date."
                error={errors.startDate?.message}
                styles={{
                  label: { fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 },
                }}
              />
            )}
          />

          <Divider label="RENCI Scholar" labelPosition="left" />

          {/* ── RENCI Scholar toggle ── */}
          <Controller
            name="renciScholar"
            control={control}
            render={({ field }) => (
              <Switch
                label="RENCI Scholar"
                checked={field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
              />
            )}
          />

          {/* ── RENCI Scholar bio — conditional ── */}
          <Collapse in={renciScholar}>
            <Stack gap={0}>
              <Controller
                name="renciScholarBio"
                control={control}
                rules={{
                  validate: (val) =>
                    !renciScholar ||
                    (typeof val === 'string' && val.trim().length > 0) ||
                    'RENCI Scholar bio is required when RENCI Scholar is enabled.',
                }}
                render={({ field }) => (
                  <LongTextInput
                    {...field}
                    label="RENCI Scholar Bio"
                    required
                    helperText="Note: this field will use a rich text editor in a future update."
                    error={errors.renciScholarBio?.message}
                  />
                )}
              />
            </Stack>
          </Collapse>

          <Divider label="Projects & biography" labelPosition="left" />

          {/* ── Projects ── */}
          <Controller
            name="projects"
            control={control}
            render={({ field }) => (
              <TagsInput
                {...field}
                label="Projects"
                data={projects || []}
                placeholder={projectsLoading ? 'Loading projects…' : 'Search by name…'}
                disabled={projectsLoading}
                error={errors.projects?.message}
                helperText="Associate this person with existing projects. Free text accepted if not found."
              />
            )}
          />

          {/* ── Bio + review checkbox ── */}
          <Stack gap={0}>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <LongTextInput
                  {...field}
                  label="Biography"
                  helperText="Note: this field will use a rich text editor in a future update."
                  error={errors.bio?.message}
                />
              )}
            />
          </Stack>

          <Divider label="Websites" labelPosition="left" />

          {/* ── Websites (useFieldArray) ── */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text fw={600} size="sm">Websites</Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => append({ url: '', label: '' })}
              >
                + Add website
              </Button>
            </Group>

            {websiteFields.length === 0 && (
              <Text size="sm" c="dimmed" fs="italic" py={4}>
                No websites added yet.
              </Text>
            )}

            {websiteFields.map((websiteField, index) => (
              <div key={websiteField.id}>
                <Group align="flex-end" gap="sm">
                  <Controller
                    name={`websites.${index}.url`}
                    control={control}
                    render={({ field }) => (
                      <UrlInput
                        {...field}
                        label="URL"
                        error={errors.websites?.[index]?.url?.message}
                        style={{ flex: 2 }}
                      />
                    )}
                  />
                  <Controller
                    name={`websites.${index}.label`}
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label="Label (optional)"
                        error={errors.websites?.[index]?.label?.message}
                        style={{ flex: 1 }}
                      />
                    )}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => remove(index)}
                    mb={1}
                    aria-label="Remove website"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
                {index < websiteFields.length - 1 && <Divider mt="sm" />}
              </div>
            ))}
          </Stack>

          <Divider label="Headshot" labelPosition="left" />

          {/* ── Headshot notice ── */}
          <Paper radius="md" p="md" style={{ background: '#f0f7fc', border: '1px solid #bfdbf7' }}>
            <Text size="sm" fw={600} mb={4}>Headshot</Text>
            <Text size="sm" c="dimmed">
              Please upload a headshot to the shared org folder, labeled with this person's full name
              (e.g. "Jane Smith"). The implementing team will retrieve it from there. A follow-up
              item will be added to the ticket automatically.
            </Text>
          </Paper>

          <Divider />

          <Group justify="flex-end">
            <Button type="submit" loading={submitting} disabled={submitting}>
              Submit request
            </Button>
          </Group>

        </Stack>
      </form>
    </Stack>
  );
}