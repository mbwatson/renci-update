// frontend/src/components/forms/AddProjectForm.jsx

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Stack,
  Group,
  Button,
  Select,
  Title,
  Text,
  Alert,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { IconTrash, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';

import TextInput from '../fields/TextInput';
import LongTextInput from '../fields/LongTextInput';
import UrlInput from '../fields/UrlInput';
import TagsInput from '../fields/TagsInput';

import { usePeople } from '../../hooks/usePeople';
import { useGroups } from '../../hooks/useGroups';
import { useOrganizations } from '../../hooks/useOrganizations';

const REVIEW_ELIGIBLE_FIELDS = ['name', 'description', 'renciRole', 'slug'];

// Informal acronyms for groups — keyed by slug.
// Not available from the API, maintained here as a display-only lookup.
const GROUP_ACRONYMS = {
  // 'data-management':                    'iRODS',
  'earth-data-science':                 'EDS',
  'networking-research-infrastructure': 'NRIG',
  'acis':                               'ACIS',
  'ood':                                'OOD',
  'research-project-management':        'RPM',
};

function groupLabel(group) {
  const acronym = GROUP_ACRONYMS[group.slug];
  return acronym ? `${group.name} (${acronym})` : group.name;
}

export default function AddProjectForm() {
  const { people, loading: peopleLoading } = usePeople();
  const { researchGroups, operationsGroups, loading: groupsLoading } = useGroups();
  const { organizations, loading: orgsLoading } = useOrganizations();

  // Build grouped Select data for Owning Group
  const owningGroupOptions = [
    {
      group: 'Research Groups',
      items: researchGroups.map((g) => ({ value: g.slug, label: groupLabel(g) })),
    },
    {
      group: 'Operations Groups',
      items: operationsGroups.map((g) => ({ value: g.slug, label: groupLabel(g) })),
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
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      submitterEmail: '',
      name: '',
      slug: '',
      description: '',
      renciRole: '',
      owningGroup: null,
      people: [],
      fundingOrgs: [],
      partnerOrgs: [],
      websites: [],
    },
  });

  const { fields: websiteFields, append, remove } = useFieldArray({
    control,
    name: 'websites',
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitError('');

    const reviewRequestsList = REVIEW_ELIGIBLE_FIELDS.filter(
      (fieldName) => !!reviewRequests[fieldName]
    );

    const payload = { ...data, reviewRequests: reviewRequestsList };

    try {
      const res = await fetch('/api/projects', {
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
        <Title order={3}>Add Project</Title>
        <Text c="dimmed" size="sm" mt={4}>
          Submit a request to add a new project to the RENCI website.
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

          <Divider label="Project details" labelPosition="left" />

          {/* ── Name + review checkbox ── */}
          <Stack gap={0}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Project Name is required.' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Project Name"
                  required
                  error={errors.name?.message}
                />
              )}
            />
          </Stack>

          {/* ── Slug + review checkbox ── */}
          <Stack gap={0}>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Preferred Slug"
                  helperText="Leave blank and the team will generate one."
                  error={errors.slug?.message}
                />
              )}
            />
          </Stack>

          {/* ── Description + review checkbox ── */}
          <Stack gap={0}>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required.' }}
              render={({ field }) => (
                <LongTextInput
                  {...field}
                  label="Description"
                  required
                  error={errors.description?.message}
                />
              )}
            />
          </Stack>

          {/* ── RENCI Role + review checkbox ── */}
          <Stack gap={0}>
            <Controller
              name="renciRole"
              control={control}
              rules={{ required: "RENCI's Role is required." }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="RENCI's Role"
                  required
                  error={errors.renciRole?.message}
                />
              )}
            />
          </Stack>

          {/* ── Owning group ── */}
          <Controller
            name="owningGroup"
            control={control}
            rules={{ required: 'Owning Group is required.' }}
            render={({ field }) => (
              <Select
                {...field}
                label="Owning Group"
                data={owningGroupOptions}
                placeholder={groupsLoading ? 'Loading groups…' : 'Select a group…'}
                disabled={groupsLoading}
                required
                error={errors.owningGroup?.message}
                clearable
                searchable
                styles={{
                  label: { fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 },
                  input: { fontSize: '0.9375rem', borderRadius: 6 },
                }}
              />
            )}
          />

          <Divider label="People & organizations" labelPosition="left" />

          {/* ── Contributors (people) ── */}
          <Controller
            name="people"
            control={control}
            render={({ field }) => (
              <TagsInput
                {...field}
                label="Contributors"
                data={people}
                placeholder={peopleLoading ? 'Loading people…' : 'Search by name…'}
                disabled={peopleLoading}
                error={errors.people?.message}
                helperText="Search for existing staff members."
              />
            )}
          />

          {/* ── Funding orgs ── */}
          <Controller
            name="fundingOrgs"
            control={control}
            render={({ field }) => (
              <TagsInput
                {...field}
                label="Funding Organizations"
                data={organizations}
                placeholder={orgsLoading ? 'Loading organizations…' : 'Search or type and press Enter…'}
                disabled={orgsLoading}
                error={errors.fundingOrgs?.message}
              />
            )}
          />

          {/* ── Partner orgs ── */}
          <Controller
            name="partnerOrgs"
            control={control}
            render={({ field }) => (
              <TagsInput
                {...field}
                label="Partner Organizations"
                data={organizations}
                placeholder={orgsLoading ? 'Loading organizations…' : 'Search or type and press Enter…'}
                disabled={orgsLoading}
                error={errors.partnerOrgs?.message}
              />
            )}
          />

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