// frontend/src/components/forms/UpdatePersonForm.jsx

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Divider,
  Select,
  MultiSelect,
  Switch,
  Modal,
  ActionIcon,
  Alert,
  Paper,
  Badge,
  Checkbox,
  TextInput as MantineTextInput,
} from '@mantine/core';
import {
  IconEye,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  TextInput,
  LongTextInput,
  AutocompleteField,
  TagsInput,
  ReadOnlyField,
} from '../fields';
import SubmitterEmailField from '../form-components/SubmitterEmailField';
import SlugConfirmation from '../form-components/SlugConfirmation';
import FormSuccessState from '../form-components/FormSuccessState';
import { usePeople } from '../../hooks/usePeople';
import { useProjects } from '../../hooks/useProjects';
import { useGroups } from '../../hooks/useGroups';

const FIELD_OPTIONS = [
  { value: 'name',          label: 'Update Name' },
  { value: 'jobTitle',      label: 'Update Job Title' },
  { value: 'bio',           label: 'Add/Update Bio' },
  { value: 'renciScholar',  label: 'Update RENCI Scholar Status' },
  { value: 'groups',        label: 'Edit Groups' },
  { value: 'projects',      label: 'Edit Projects' },
  { value: 'websites',      label: 'Edit Websites' },
  { value: 'headshot',      label: 'Update Headshot' },
  { value: 'other',         label: 'Other' },
];

function SectionLabel({ children }) {
  return (
    <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
      {children}
    </Text>
  );
}

function RemovePills({ currentItems = [], value = [], onChange, emptyMessage }) {
  const markedSlugs = new Set(value);
  const toggle = (slug) => {
    const next = markedSlugs.has(slug) ? value.filter((s) => s !== slug) : [...value, slug];
    onChange(next);
  };
  if (currentItems.length === 0) {
    return <Text size="sm" c="dimmed">{emptyMessage ?? 'None currently listed.'}</Text>;
  }
  return (
    <Group gap="xs" wrap="wrap">
      {[...currentItems].sort((a, b) => a.name.localeCompare(b.name)).map((item) => {
        const marked = markedSlugs.has(item.slug);
        return (
          <Badge key={item.slug} variant={marked ? 'filled' : 'light'} color={marked ? 'red' : 'gray'} size="lg"
            style={{ cursor: 'pointer', textDecoration: marked ? 'line-through' : 'none', userSelect: 'none' }}
            rightSection={<ActionIcon size="xs" color={marked ? 'red' : 'gray'} variant="transparent"><IconX size={10} /></ActionIcon>}
            onClick={() => toggle(item.slug)}
          >
            {item.name}
          </Badge>
        );
      })}
    </Group>
  );
}

function EditableWebsiteList({ currentItems = [], value, onChange }) {
  const [items, setItems] = useState(() =>
    value?.length ? value : currentItems.map((w) => ({ ...w, _status: 'included' }))
  );
  const notify = (next) => {
    setItems(next);
    onChange({
      keep:   next.filter((i) => i._status === 'included').map(({ _status, ...r }) => r),
      remove: next.filter((i) => i._status === 'removed').map(({ _status, ...r }) => r),
      add:    next.filter((i) => i._status === 'added').map(({ _status, ...r }) => r),
    });
  };
  const toggle = (idx) => notify(items.map((item, i) => {
    if (i !== idx) return item;
    if (item._status === 'included') return { ...item, _status: 'removed' };
    if (item._status === 'removed')  return { ...item, _status: 'included' };
    if (item._status === 'added')    return { ...item, _status: 'removed' };
    return item;
  }));
  const updateField = (idx, field, val) => notify(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  const addRow = () => notify([...items, { url: '', label: '', _status: 'added' }]);

  return (
    <Stack gap="sm">
      {items.length > 0 && (
        <Stack gap="xs">
          {items.map((item, idx) => {
            const isRemoved = item._status === 'removed';
            const isNew     = item._status === 'added';
            return (
              <Group key={idx} gap="xs" align="flex-end" wrap="nowrap">
                <ActionIcon size="sm" variant="subtle" color={isRemoved ? 'red' : isNew ? 'teal' : 'gray'} onClick={() => toggle(idx)} mb={4}>
                  <IconX size={14} style={{ opacity: isRemoved ? 1 : 0.35 }} />
                </ActionIcon>
                <MantineTextInput placeholder="https://..." value={item.url || ''} onChange={(e) => updateField(idx, 'url', e.target.value)} disabled={isRemoved} style={{ flex: 2 }} size="sm" label={idx === 0 ? 'URL' : undefined} />
                <MantineTextInput placeholder="Label (optional)" value={item.label || ''} onChange={(e) => updateField(idx, 'label', e.target.value)} disabled={isRemoved} style={{ flex: 1 }} size="sm" label={idx === 0 ? 'Label' : undefined} />
              </Group>
            );
          })}
        </Stack>
      )}
      <Button variant="subtle" size="xs" leftSection={<IconPlus size={14} />} onClick={addRow} style={{ alignSelf: 'flex-start' }}>Add website</Button>
    </Stack>
  );
}

function ChangeBlockInput({ fieldKey, control, index, selectedPerson }) {
  const { projects } = useProjects();
  const { researchGroups, operationsGroups } = useGroups();
  const [nameChecks, setNameChecks] = useState({ firstName: false, lastName: false, preferredName: false });

  const allGroupOptions = [
    { group: 'Research Groups', items: (researchGroups || []).map((g) => ({ value: g.slug, label: g.name })) },
    { group: 'Operations Groups', items: (operationsGroups || []).map((g) => ({ value: g.slug, label: g.name })) },
  ];

  switch (fieldKey) {
    case 'name':
      return (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">Check the name components you want to update. At least one must be selected.</Text>
          {[
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'preferredName', label: 'Preferred Name' },
          ].map(({ key, label }) => (
            <Box key={key}>
              <Checkbox label={label} checked={nameChecks[key]} onChange={(e) => setNameChecks((prev) => ({ ...prev, [key]: e.currentTarget.checked }))} />
              {nameChecks[key] && (
                <Stack gap={4} pl="xl" mt="xs">
                  <Controller name={`changes.${index}.value.${key}`} control={control} rules={{ required: `${label} is required when selected.` }}
                    render={({ field, fieldState }) => <TextInput {...field} label={`New ${label}`} required error={fieldState.error?.message} />}
                  />
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      );
    case 'jobTitle':
      return (
        <Stack gap="xs">
          {selectedPerson?.jobTitle && <ReadOnlyField label="Current Job Title" value={selectedPerson.jobTitle} />}
          <Controller name={`changes.${index}.value`} control={control} rules={{ required: 'New job title is required.' }}
            render={({ field, fieldState }) => <TextInput {...field} label="New Job Title" required helperText="Semicolon-separated if multiple titles." error={fieldState.error?.message} />}
          />
        </Stack>
      );
    case 'bio':
      return (
        <Stack gap="xs">
          {selectedPerson?.bio && <ReadOnlyField label="Current Bio" value={selectedPerson.bio} />}
          <Controller name={`changes.${index}.value`} control={control} rules={{ required: 'Bio is required.' }}
            render={({ field, fieldState }) => <LongTextInput {...field} label="New Bio" required helperText="Note: a rich text editor will replace this field in a future update." error={fieldState.error?.message} />}
          />
        </Stack>
      );
    case 'renciScholar':
      return (
        <Stack gap="sm">
          {selectedPerson?.renciScholar !== undefined && <ReadOnlyField label="Current Status" value={selectedPerson.renciScholar ? 'RENCI Scholar: Yes' : 'RENCI Scholar: No'} />}
          <Controller name={`changes.${index}.value.renciScholar`} control={control}
            render={({ field }) => <Switch checked={!!field.value} onChange={(e) => field.onChange(e.currentTarget.checked)} label="RENCI Scholar" />}
          />
          <Controller name={`changes.${index}.value.renciScholar`} control={control}
            render={({ field: switchField }) => switchField.value ? (
              <Controller name={`changes.${index}.value.renciScholarBio`} control={control}
                render={({ field, fieldState }) => <LongTextInput {...field} label="RENCI Scholar Bio" helperText="Note: a rich text editor will replace this field in a future update." error={fieldState.error?.message} />}
              />
            ) : null}
          />
        </Stack>
      );
    case 'groups': {
      const currentGroupSlugs = (selectedPerson?.groups || []).map((g) => g.slug);
      return (
        <Controller name={`changes.${index}.value`} control={control} defaultValue={{ add: [], remove: [] }}
          render={({ field }) => {
            const addValue    = field.value?.add    ?? [];
            const removeValue = field.value?.remove ?? [];
            const notify      = (patch) => field.onChange({ add: addValue, remove: removeValue, ...patch });
            const addedSlugs  = new Set(addValue);
            const addOptions  = [
              { group: 'Research Groups', items: (researchGroups || []).filter((g) => !currentGroupSlugs.includes(g.slug) && !addedSlugs.has(g.slug)).map((g) => ({ value: g.slug, label: g.name })) },
              { group: 'Operations Groups', items: (operationsGroups || []).filter((g) => !currentGroupSlugs.includes(g.slug) && !addedSlugs.has(g.slug)).map((g) => ({ value: g.slug, label: g.name })) },
            ];
            return (
              <Stack gap="md">
                <Box>
                  <Group justify="space-between" align="baseline" mb={6}>
                    <SectionLabel>Current groups</SectionLabel>
                    {removeValue.length > 0 && <Text size="xs" c="red">{removeValue.length} marked for removal</Text>}
                  </Group>
                  <RemovePills currentItems={selectedPerson?.groups || []} value={removeValue} onChange={(slugs) => notify({ remove: slugs })} emptyMessage="No groups currently assigned." />
                </Box>
                <Divider variant="dashed" />
                <Box>
                  <Group justify="space-between" align="baseline" mb={6}>
                    <SectionLabel>Add groups</SectionLabel>
                    {addValue.length > 0 && <Text size="xs" c="teal">{addValue.length} to be added</Text>}
                  </Group>
                  <MultiSelect data={addOptions} value={addValue} onChange={(vals) => notify({ add: vals })} placeholder="Select groups to add" searchable />
                </Box>
              </Stack>
            );
          }}
        />
      );
    }
    case 'projects': {
      const currentProjects = selectedPerson?.projects || [];
      const currentSlugs    = new Set(currentProjects.map((p) => p.slug));
      const available       = (projects || []).filter((p) => !currentSlugs.has(p.slug));
      return (
        <Controller name={`changes.${index}.value`} control={control} defaultValue={{ add: [], remove: [] }}
          render={({ field }) => {
            const addValue    = field.value?.add    ?? [];
            const removeValue = field.value?.remove ?? [];
            const notify      = (patch) => field.onChange({ add: addValue, remove: removeValue, ...patch });
            return (
              <Stack gap="md">
                <Box>
                  <Group justify="space-between" align="baseline" mb={6}>
                    <SectionLabel>Current projects</SectionLabel>
                    {removeValue.length > 0 && <Text size="xs" c="red">{removeValue.length} marked for removal</Text>}
                  </Group>
                  <RemovePills currentItems={currentProjects} value={removeValue} onChange={(slugs) => notify({ remove: slugs })} emptyMessage="No projects currently associated." />
                </Box>
                <Divider variant="dashed" />
                <Box>
                  <Group justify="space-between" align="baseline" mb={6}>
                    <SectionLabel>Add projects</SectionLabel>
                    {Array.isArray(addValue) && addValue.length > 0 && <Text size="xs" c="teal">{addValue.length} to be added</Text>}
                  </Group>
                  <TagsInput data={available} value={addValue} onChange={(vals) => notify({ add: vals })} helperText="Search by name. Free text accepted if no match found." />
                </Box>
              </Stack>
            );
          }}
        />
      );
    }
    case 'websites':
      return (
        <Controller name={`changes.${index}.value`} control={control} defaultValue={null}
          render={({ field }) => <EditableWebsiteList currentItems={selectedPerson?.websites || []} value={field.value?.items || null} onChange={(val) => field.onChange(val)} />}
        />
      );
    case 'headshot':
      return (
        <Paper radius="md" p="md" style={{ background: '#f0f7fc', border: '1px solid #bbd6ea' }}>
          <Text size="sm">
            Please upload a new headshot to the shared org folder labeled{' '}
            <strong>{selectedPerson?.name || '[Person Name]'}</strong>. The implementing team will retrieve it from there.
          </Text>
        </Paper>
      );
    case 'other':
      return (
        <Controller name={`changes.${index}.value`} control={control} rules={{ required: 'Please describe the change.' }}
          render={({ field, fieldState }) => <LongTextInput {...field} label="Describe the change" helperText="Use this for edge cases not covered by the options above." required error={fieldState.error?.message} />}
        />
      );
    default:
      return null;
  }
}

function CurrentDataModal({ opened, onClose, person }) {
  if (!person) return null;
  const groupNames   = (person.groups || []).sort((a, b) => a.name.localeCompare(b.name)).map((g) => g.name).join(', ');
  const projectNames = (person.projects || []).sort((a, b) => a.name.localeCompare(b.name)).map((p) => p.name).join(', ');
  const fields = [
    { label: 'Name',              value: person.name },
    { label: 'Slug',              value: person.slug },
    { label: 'Active',            value: person.active === true ? 'Yes' : person.active === false ? 'No' : null },
    { label: 'Job Title',         value: person.jobTitle },
    { label: 'Groups',            value: groupNames || null },
    { label: 'RENCI Scholar',     value: person.renciScholar ? 'Yes' : 'No' },
    { label: 'RENCI Scholar Bio', value: person.renciScholarBio },
    { label: 'Projects',          value: projectNames || null },
    { label: 'Bio',               value: person.bio },
    { label: 'Websites',          value: person.websites?.length ? person.websites.map((w) => w.label ? `${w.label}: ${w.url}` : w.url).join(', ') : null },
  ];
  return (
    <Modal opened={opened} onClose={onClose} title={`Current data: ${person.name}`} size="lg">
      <Stack gap="sm">
        {fields.map(({ label, value }) => (
          <Box key={label}>
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" lts={0.5}>{label}</Text>
            <Text size="sm">{value || '—'}</Text>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
}

export default function UpdatePersonForm() {
  const { people, loading: peopleLoading, error: peopleError } = usePeople();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldSelections, setFieldSelections] = useState({});

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { submitterEmail: '', slug: '', changes: [] },
  });

  const { fields: changeFields, append, remove } = useFieldArray({ control, name: 'changes' });

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setValue('slug', person?.slug || '');
    reset((prev) => ({ ...prev, slug: person?.slug || '', changes: [] }));
    setFieldSelections({});
  };

  const handleFieldSelect = (index, val) => {
    setFieldSelections((prev) => ({ ...prev, [index]: val }));
    setValue(`changes.${index}.field`, val);
    const relationalDefaults = { groups: { add: [], remove: [] }, projects: { add: [], remove: [] } };
    setValue(`changes.${index}.value`, relationalDefaults[val] ?? null);
  };

  const addChangeBlock = () => append({ field: '', value: null });

  const removeChangeBlock = (index) => {
    remove(index);
    setFieldSelections((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };

  const onSubmit = async (data) => {
    setSubmitError(null);
    const validChanges = data.changes.filter((_, i) => fieldSelections[i]);
    if (validChanges.length === 0) { setSubmitError('Please add at least one change block.'); return; }

    const changes = data.changes
      .map((change, i) => {
        const fieldKey = fieldSelections[i];
        if (!fieldKey) return null;
        const label = FIELD_OPTIONS.find((o) => o.value === fieldKey)?.label || fieldKey;
        return { field: fieldKey, label, value: change.value };
      })
      .filter(Boolean);

    try {
      const res = await fetch('/api/people/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitterEmail: data.submitterEmail, slug: data.slug, changes }),
      });

      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        if (body.code === 'VPN_REQUIRED') { setSubmitError('Could not connect to the data API. Make sure you are connected to the VPN and try again.'); return; }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.errors?.map((e) => e.message).join(', ') || 'Submission failed. Please try again.');
        return;
      }

      setSubmitSuccess(true);
      setSelectedPerson(null);
      setFieldSelections({});
      reset({ submitterEmail: '', slug: '', changes: [] });
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  if (submitSuccess) {
    return <FormSuccessState onReset={() => setSubmitSuccess(false)} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="xl">
        <Box>
          <Title order={4} mb="sm">Identify the Person</Title>
          <Stack gap="sm">
            {peopleError ? (
              <Alert color="red">Could not load people. Make sure you are connected to the VPN.</Alert>
            ) : (
              <>
                <Group gap="sm" align="flex-end">
                  <Box style={{ flex: 1 }}>
                    <AutocompleteField label="Person" required data={people || []} value={selectedPerson} onChange={handlePersonSelect} loading={peopleLoading} />
                  </Box>
                  {selectedPerson && (
                    <ActionIcon variant="subtle" size="lg" mb={1} onClick={() => setModalOpen(true)} title="View current person data">
                      <IconEye size={18} />
                    </ActionIcon>
                  )}
                </Group>
                {selectedPerson && (
                  <SlugConfirmation
                    slug={selectedPerson.slug}
                    href={`https://renci.org/team/${selectedPerson.slug}`}
                    linkText="View Profile"
                  />
                )}
              </>
            )}
          </Stack>
        </Box>

        {selectedPerson && (
          <>
            <Divider />
            <Box>
              <Title order={4} mb="xs">Declare Changes</Title>
              <Text size="sm" c="dimmed" mb="md">Add one block per change. Each block becomes a separate action item on the ticket.</Text>
              <Stack gap="md">
                {changeFields.map((item, index) => (
                  <Paper key={item.id} withBorder p="md" radius="sm">
                    <Stack gap="sm">
                      <Group justify="space-between" align="center">
                        <Text size="sm" fw={500}>Change {index + 1}</Text>
                        <ActionIcon color="red" variant="subtle" size="sm" onClick={() => removeChangeBlock(index)}><IconTrash size={14} /></ActionIcon>
                      </Group>
                      <Select label="What are you changing?" placeholder="Select a field" data={FIELD_OPTIONS} value={fieldSelections[index] || null} onChange={(val) => handleFieldSelect(index, val)} required />
                      {fieldSelections[index] && (
                        <ChangeBlockInput key={fieldSelections[index]} fieldKey={fieldSelections[index]} control={control} index={index} selectedPerson={selectedPerson} />
                      )}
                    </Stack>
                  </Paper>
                ))}
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addChangeBlock} style={{ alignSelf: 'flex-start' }}>Add change</Button>
                {submitError && <Alert color="red" mt="xs">{submitError}</Alert>}
              </Stack>
            </Box>

            <Divider />

            <SubmitterEmailField control={control} error={errors.submitterEmail?.message} />

            <Button type="submit" loading={isSubmitting} fullWidth>Submit Update Request</Button>
          </>
        )}
      </Stack>

      <CurrentDataModal opened={modalOpen} onClose={() => setModalOpen(false)} person={selectedPerson} />
    </form>
  );
}