// frontend/src/components/form-blocks/EditableWebsiteList.jsx

import { useState } from 'react';
import { Stack, Group, Button, ActionIcon, TextInput } from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';

/**
 * EditableWebsiteList
 * Manages a mixed list of existing and new website entries.
 * Used in the "websites" change block of UpdateProjectForm and UpdatePersonForm.
 *
 * Each item has a `_status` of 'included' | 'removed' | 'added'.
 * Clicking the X icon on an existing item toggles it between included/removed.
 * Clicking on a removed new item removes it from the list entirely.
 *
 * onChange receives: { keep: [...], remove: [...], add: [...] }
 * where each array contains items without the internal _status field.
 *
 * Usage:
 *   <EditableWebsiteList
 *     currentItems={selectedProject.websites}
 *     value={field.value?.items || null}
 *     onChange={(val) => field.onChange(val)}
 *   />
 */
export default function EditableWebsiteList({ currentItems = [], value, onChange }) {
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

  const toggle = (idx) =>
    notify(
      items.map((item, i) => {
        if (i !== idx) return item;
        if (item._status === 'included') return { ...item, _status: 'removed' };
        if (item._status === 'removed')  return { ...item, _status: 'included' };
        if (item._status === 'added')    return { ...item, _status: 'removed' };
        return item;
      })
    );

  const updateField = (idx, field, val) =>
    notify(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));

  const addRow = () =>
    notify([...items, { url: '', label: '', _status: 'added' }]);

  return (
    <Stack gap="sm">
      {items.length > 0 && (
        <Stack gap="xs">
          {items.map((item, idx) => {
            const isRemoved = item._status === 'removed';
            const isNew     = item._status === 'added';
            return (
              <Group key={idx} gap="xs" align="flex-end" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color={isRemoved ? 'red' : isNew ? 'teal' : 'gray'}
                  onClick={() => toggle(idx)}
                  mb={4}
                >
                  <IconX size={14} style={{ opacity: isRemoved ? 1 : 0.35 }} />
                </ActionIcon>
                <TextInput
                  placeholder="https://..."
                  value={item.url || ''}
                  onChange={(e) => updateField(idx, 'url', e.target.value)}
                  disabled={isRemoved}
                  style={{ flex: 2 }}
                  size="sm"
                  label={idx === 0 ? 'URL' : undefined}
                />
                <TextInput
                  placeholder="Label (optional)"
                  value={item.label || ''}
                  onChange={(e) => updateField(idx, 'label', e.target.value)}
                  disabled={isRemoved}
                  style={{ flex: 1 }}
                  size="sm"
                  label={idx === 0 ? 'Label' : undefined}
                />
              </Group>
            );
          })}
        </Stack>
      )}
      <Button
        variant="subtle"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={addRow}
        style={{ alignSelf: 'flex-start' }}
      >
        Add website
      </Button>
    </Stack>
  );
}