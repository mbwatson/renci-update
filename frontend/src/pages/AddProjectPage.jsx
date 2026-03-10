// frontend/src/pages/AddProjectPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Container, Stack, Text, Button, Group } from '@mantine/core';
import AddProjectForm from '../components/forms/AddProjectForm';
import DraftBanner from '../components/form-blocks/DraftBanner';
import FormSuccessState from '../components/form-blocks/FormSuccessState';
import { useDraft } from '../hooks/useDraft';
import { useState } from 'react';

const FORM_KEY = 'add:project';

const DEFAULT_VALUES = {
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
};

export default function AddProjectPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Add Project — RENCI Website Change Requests';
  }, []);

  const { reset, watch, control, handleSubmit, formState } = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const { draft, saveDraft, resumeDraft, discardDraft } = useDraft(FORM_KEY, reset);

  const handleSuccess = () => {
    discardDraft();
    setSubmitted(true);
  };

  const handleSubmitAnother = () => {
    reset(DEFAULT_VALUES);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Container size="sm" py="xl">
        <FormSuccessState
          message="Your request has been submitted. Check your email for a confirmation from the web team."
          onReset={handleSubmitAnother}
          secondaryAction={
            <Button variant="subtle" size="xs" onClick={() => navigate('/')}>
              Submit a different request
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Text
          size="xs"
          c="dimmed"
          fw={500}
          style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Add Project
        </Text>

        {draft && (
          <DraftBanner
            savedAt={draft.savedAt}
            onResume={resumeDraft}
            onDiscard={discardDraft}
          />
        )}

        <AddProjectForm
          control={control}
          watch={watch}
          handleSubmit={handleSubmit}
          formState={formState}
          reset={reset}
          saveDraft={saveDraft}
          onSuccess={handleSuccess}
        />
      </Stack>
    </Container>
  );
}