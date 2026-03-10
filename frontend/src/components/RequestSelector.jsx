// frontend/src/components/RequestSelector.jsx

import { useState } from 'react';
import { Container, Select, Text, Box, Stack, Paper, Transition } from '@mantine/core';
import AddProjectForm from './forms/AddProjectForm';
import UpdateProjectForm from './forms/UpdateProjectForm';
import ArchiveProjectForm from './forms/ArchiveProjectForm';
import AddPersonForm from './forms/AddPersonForm';
import UpdatePersonForm from './forms/UpdatePersonForm';
import ArchivePersonForm from './forms/ArchivePersonForm';

const ACTION_OPTIONS = [
  { value: 'add', label: 'Add' },
  { value: 'update', label: 'Update' },
  { value: 'archive', label: 'Archive' },
];

const ENTITY_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'person', label: 'Person' },
];

function getForm(action, entity) {
  if (!action || !entity) return null;
  const key = `${action}-${entity}`;
  switch (key) {
    case 'add-project':     return <AddProjectForm />;
    case 'update-project':  return <UpdateProjectForm />;
    case 'archive-project': return <ArchiveProjectForm />;
    case 'add-person':      return <AddPersonForm />;
    case 'update-person':   return <UpdatePersonForm />;
    case 'archive-person':  return <ArchivePersonForm />;
    default:
      return (
        <Stack gap="xs" align="center" py="xl">
          <Text size="sm" fw={600} c="#005b8e">Coming soon</Text>
          <Text size="xs" c="dimmed">This form hasn't been built yet.</Text>
        </Stack>
      );
  }
}

export default function RequestSelector() {
  const [action, setAction] = useState(null);
  const [entity, setEntity] = useState(null);

  const form = getForm(action, entity);
  const formVisible = !!form;

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">

        {/* Intro text — fades out once both selectors have a value */}
        <Transition mounted={!formVisible} transition="fade" duration={200} timingFunction="ease">
          {(styles) => (
            <Box style={styles}>
              <Text size="sm" c="dimmed">
                This tool is for RENCI staff to submit website change requests. Use it to add,
                update, or archive projects and people on the RENCI website. Requests are reviewed
                by the web team before any changes go live.
              </Text>
            </Box>
          )}
        </Transition>

        {/* Selector card */}
        <Paper
          withBorder
          radius="md"
          p="xl"
          style={{ background: '#fff', borderColor: '#e0e0e0' }}
        >
          <Stack gap="md">
            <Text
              size="sm"
              c="dimmed"
              fw={500}
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              New Request
            </Text>

            <Box
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                rowGap: '0.75rem',
              }}
            >
              <Text size="lg" fw={500} c="#1a1a1a">I'd like to</Text>

              <Select
                data={ACTION_OPTIONS}
                value={action}
                onChange={setAction}
                placeholder="choose an action"
                size="md"
                radius="md"
                style={{ minWidth: 160 }}
                styles={{
                  input: {
                    fontWeight: 600,
                    color: action ? '#005b8e' : undefined,
                    borderColor: action ? '#005b8e' : undefined,
                    background: action ? '#f0f7fc' : '#fff',
                  },
                }}
                aria-label="Select action"
              />

              <Text size="lg" fw={500} c="#1a1a1a">a</Text>

              <Select
                data={ENTITY_OPTIONS}
                value={entity}
                onChange={setEntity}
                placeholder="choose a type"
                size="md"
                radius="md"
                style={{ minWidth: 150 }}
                styles={{
                  input: {
                    fontWeight: 600,
                    color: entity ? '#005b8e' : undefined,
                    borderColor: entity ? '#005b8e' : undefined,
                    background: entity ? '#f0f7fc' : '#fff',
                  },
                }}
                aria-label="Select entity type"
              />

              <Text size="lg" fw={500} c="#1a1a1a">.</Text>
            </Box>
          </Stack>
        </Paper>

        {/* Form area */}
        {form && (
          <Paper
            withBorder
            radius="md"
            p="xl"
            style={{ background: '#fff', borderColor: '#e0e0e0' }}
          >
            {form}
          </Paper>
        )}

      </Stack>
    </Container>
  );
}