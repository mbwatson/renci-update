// frontend/src/components/form-blocks/RelationalFieldEditor.jsx

import { Box, Group, Stack, Text, Badge, ActionIcon, Divider } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import SectionLabel from './SectionLabel';

/**
 * RemovePills
 * Internal component — renders current items as clickable badges.
 * Clicking a badge toggles its slug in/out of the `value` (remove) array.
 * Not exported — use RelationalFieldEditor instead.
 */
function RemovePills({ currentItems = [], value = [], onChange, emptyMessage }) {
  const markedSlugs = new Set(value);

  const toggle = (slug) => {
    const next = markedSlugs.has(slug)
      ? value.filter((s) => s !== slug)
      : [...value, slug];
    onChange(next);
  };

  if (currentItems.length === 0) {
    return <Text size="sm" c="dimmed">{emptyMessage ?? 'None currently listed.'}</Text>;
  }

  return (
    <Group gap="xs" wrap="wrap">
      {[...currentItems]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => {
          const marked = markedSlugs.has(item.slug);
          return (
            <Badge
              key={item.slug}
              variant={marked ? 'filled' : 'light'}
              color={marked ? 'red' : 'gray'}
              size="lg"
              style={{
                cursor: 'pointer',
                textDecoration: marked ? 'line-through' : 'none',
                userSelect: 'none',
              }}
              rightSection={
                <ActionIcon size="xs" color={marked ? 'red' : 'gray'} variant="transparent">
                  <IconX size={10} />
                </ActionIcon>
              }
              onClick={() => toggle(item.slug)}
            >
              {item.name}
            </Badge>
          );
        })}
    </Group>
  );
}

/**
 * RelationalFieldEditor
 * Shared chrome for add/remove relational field panels.
 * Used by EditContributors and EditOrganizations in both Update forms.
 *
 * Handles:
 * - Current items as removable pills (RemovePills)
 * - Pending removal count
 * - Dashed divider
 * - "Add" section header with pending add count
 * - Slotted add panel via `addPanel` render prop
 *
 * The `value` and `onChange` props follow the { add, remove } shape.
 * `addCount` is the number of pending additions to display in the counter —
 * the caller computes this since the add panel varies (tags vs org forms).
 *
 * Usage:
 *   <RelationalFieldEditor
 *     currentLabel="Current contributors"
 *     addLabel="Add contributors"
 *     currentItems={selectedProject.people}
 *     removeValue={removeValue}
 *     onRemoveChange={(slugs) => notify({ remove: slugs })}
 *     emptyMessage="No contributors currently listed."
 *     addCount={addValue.length}
 *     addPanel={<TagsInput ... />}
 *   />
 */
export default function RelationalFieldEditor({
  currentLabel,
  addLabel,
  currentItems = [],
  removeValue = [],
  onRemoveChange,
  emptyMessage,
  addCount = 0,
  addPanel,
}) {
  return (
    <Stack gap="md">
      <Box>
        <Group justify="space-between" align="baseline" mb={6}>
          <SectionLabel>{currentLabel}</SectionLabel>
          {removeValue.length > 0 && (
            <Text size="xs" c="red">{removeValue.length} marked for removal</Text>
          )}
        </Group>
        <RemovePills
          currentItems={currentItems}
          value={removeValue}
          onChange={onRemoveChange}
          emptyMessage={emptyMessage}
        />
      </Box>

      <Divider variant="dashed" />

      <Box>
        <Group justify="space-between" align="baseline" mb={6}>
          <SectionLabel>{addLabel}</SectionLabel>
          {addCount > 0 && (
            <Text size="xs" c="teal">{addCount} to be added</Text>
          )}
        </Group>
        {addPanel}
      </Box>
    </Stack>
  );
}