import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Badge,
  Group,
  Button,
  Code,
} from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';

import TextInput from '../components/form-elements/TextInput';
import LongTextInput from '../components/form-elements/LongTextInput';
import UrlInput from '../components/form-elements/UrlInput';
import AutocompleteField from '../components/form-elements/AutocompleteField';
import RepeatableField from '../components/form-elements/RepeatableField';
import FieldSelector from '../components/form-elements/FieldSelector';
import ReadOnlyField from '../components/form-elements/ReadOnlyField';

// ─── Sample data ──────────────────────────────────────────────────────────────
const SAMPLE_PROJECTS = [
  { name: 'FABRIC Testbed', slug: 'fabric-testbed', id: 1 },
  { name: 'RENCI Cloud', slug: 'renci-cloud', id: 2 },
  { name: 'iRODS', slug: 'irods', id: 3 },
  { name: 'Heal Platform', slug: 'heal-platform', id: 4 },
  { name: 'CHORD', slug: 'chord', id: 5 },
];

// Field definitions for FieldSelector (mirrors Update Project change blocks)
const UPDATE_PROJECT_FIELDS = [
  {
    value: 'name',
    label: 'Update Name',
    render: (onChange, val) => (
      <TextInput
        label="New Name"
        value={val ?? ''}
        onChange={onChange}
        placeholder="Enter new project name"
      />
    ),
  },
  {
    value: 'description',
    label: 'Update Description',
    render: (onChange, val) => (
      <LongTextInput
        label="New Description"
        value={val ?? ''}
        onChange={onChange}
        placeholder="Describe the project…"
      />
    ),
  },
  {
    value: 'renciRole',
    label: "Update RENCI's Role",
    render: (onChange, val) => (
      <TextInput
        label="New RENCI Role"
        value={val ?? ''}
        onChange={onChange}
        placeholder="e.g. Lead developer, Partner"
      />
    ),
  },
  {
    value: 'other',
    label: 'Other (free text)',
    render: (onChange, val) => (
      <LongTextInput
        label="Describe the change"
        value={val ?? ''}
        onChange={onChange}
        placeholder="Describe what you'd like changed…"
        minRows={2}
      />
    ),
  },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
function SectionHeader({ name, file }) {
  return (
    <Group gap="xs" align="baseline" mb="md">
      <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
        {name}
      </Text>
      <Code fz="xs" c="dimmed">{file}</Code>
    </Group>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const { control, formState: { errors }, setError, clearErrors } = useForm({
    defaultValues: {
      textInput: '',
      longText: '',
      urlInput: '',
      autocomplete: null,
      websites: [{ url: '', label: '' }],
    },
  });

  // FieldSelector manages its own local state — not wired through RHF here
  // because useFieldArray (the real pattern) needs a form context with a named
  // array field. For preview purposes, plain useState is correct.
  const [changes, setChanges] = useState([{ field: '', data: null }]);

  return (
    <Container size="sm" py="xl">
      <Stack gap={0} mb="xl">
        <Group gap="xs" align="center">
          <Title order={2}>Field Components</Title>
          <Badge variant="light" color="blue" size="sm">RN-196</Badge>
        </Group>
        <Text c="dimmed" size="sm" mt={4}>
          Preview only — not a real form path. Remove or gate behind{' '}
          <Code fz="xs">import.meta.env.DEV</Code> before launch.
        </Text>
      </Stack>

      <Stack gap="xl">

        {/* ── TextInput ──────────────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="TextInput" file="components/fields/TextInput.jsx" />
          <Controller
            name="textInput"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Project Name"
                placeholder="e.g. FABRIC Testbed"
                helperText="The public-facing name of the project."
                error={errors.textInput?.message}
                required
              />
            )}
          />
          <Group mt="sm" gap="xs">
            <Button size="xs" variant="light" color="red"
              onClick={() => setError('textInput', { message: 'Project Name is required' })}>
              Trigger error
            </Button>
            <Button size="xs" variant="subtle" color="gray"
              onClick={() => clearErrors('textInput')}>
              Clear error
            </Button>
          </Group>
        </Paper>

        {/* ── LongTextInput ──────────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="LongTextInput" file="components/fields/LongTextInput.jsx" />
          <Controller
            name="longText"
            control={control}
            render={({ field }) => (
              <LongTextInput
                {...field}
                label="RENCI's Role"
                placeholder="Describe RENCI's involvement…"
                helperText="Free text. This will appear on the Monday ticket."
                minRows={3}
              />
            )}
          />
        </Paper>

        {/* ── UrlInput ───────────────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="UrlInput" file="components/fields/UrlInput.jsx" />
          <Controller
            name="urlInput"
            control={control}
            render={({ field }) => (
              <UrlInput
                {...field}
                label="Website URL"
                helperText="Include https://"
                error={errors.urlInput?.message}
              />
            )}
          />
          <Group mt="sm" gap="xs">
            <Button size="xs" variant="light" color="red"
              onClick={() => setError('urlInput', { message: 'Please enter a valid URL' })}>
              Trigger error
            </Button>
            <Button size="xs" variant="subtle" color="gray"
              onClick={() => clearErrors('urlInput')}>
              Clear error
            </Button>
          </Group>
        </Paper>

        {/* ── AutocompleteField ──────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="AutocompleteField" file="components/fields/AutocompleteField.jsx" />
          <Text size="xs" c="dimmed" mb="sm">
            Try typing "fabric" or "irods" — slug appears as subtitle on each option and
            as a read-only confirmation after selection.
          </Text>
          <Controller
            name="autocomplete"
            control={control}
            render={({ field }) => (
              <AutocompleteField
                {...field}
                label="Project"
                data={SAMPLE_PROJECTS}
                helperText="Start typing to search by name or slug."
                required
              />
            )}
          />
        </Paper>

        {/* ── ReadOnlyField ──────────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="ReadOnlyField" file="components/fields/ReadOnlyField.jsx" />
          <Text size="xs" c="dimmed" mb="sm">
            Used on Update/Archive forms to show existing data above a change input.
          </Text>
          <Stack gap="sm">
            <ReadOnlyField label="Current Name" value="FABRIC Testbed" />
            <ReadOnlyField label="Current Slug" value="fabric-testbed" monospace />
            <ReadOnlyField label="Current Description" value="" />
          </Stack>
        </Paper>

        {/* ── RepeatableField ────────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="RepeatableField" file="components/fields/RepeatableField.jsx" />
          <Controller
            name="websites"
            control={control}
            render={({ field }) => (
              <RepeatableField
                {...field}
                label="Websites"
                addLabel="Add website"
                emptyMessage="No websites added yet."
                helperText="Add one or more URLs with an optional display label."
                initialItem={() => ({ url: '', label: '' })}
                renderItem={(item, index, onItemChange, onRemove) => (
                  <Group align="flex-end" gap="sm" wrap="nowrap">
                    <div style={{ flex: 2 }}>
                      <UrlInput
                        label="URL"
                        value={item.url}
                        onChange={(val) => onItemChange(index, { ...item, url: val })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <TextInput
                        label="Label (optional)"
                        value={item.label}
                        onChange={(val) => onItemChange(index, { ...item, label: val })}
                        placeholder="e.g. Project site"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="subtle"
                      color="red"
                      mb={1}
                      onClick={() => onRemove(index)}
                    >
                      Remove
                    </Button>
                  </Group>
                )}
              />
            )}
          />
        </Paper>

        {/* ── FieldSelector ──────────────────────────────────────────────── */}
        <Paper withBorder p="lg" radius="md">
          <SectionHeader name="FieldSelector" file="components/fields/FieldSelector.jsx" />
          <Text size="xs" c="dimmed" mb="sm">
            The "change block" for Update forms. Select a field to see its input render below.
            Add blocks to simulate multiple changes in one submission.
          </Text>
          <Stack gap="sm">
            {changes.map((change, index) => (
              <FieldSelector
                key={index}
                fields={UPDATE_PROJECT_FIELDS}
                value={change}
                onChange={(val) =>
                  setChanges((prev) => prev.map((c, i) => (i === index ? val ?? { field: '', data: null } : c)))
                }
                blockIndex={index + 1}
                onRemove={
                  changes.length > 1
                    ? () => setChanges((prev) => prev.filter((_, i) => i !== index))
                    : undefined
                }
              />
            ))}
            <Button
              size="xs"
              variant="light"
              onClick={() => setChanges((prev) => [...prev, { field: '', data: null }])}
            >
              + Add another change
            </Button>
          </Stack>
        </Paper>

      </Stack>
    </Container>
  );
}