// frontend/src/pages/UpdateProjectPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Container, Stack, Text, Button } from '@mantine/core';
import UpdateProjectForm from '../components/forms/UpdateProjectForm';
import DraftBanner from '../components/form-blocks/DraftBanner';
import FormSuccessState from '../components/form-blocks/FormSuccessState';
import { useDraft } from '../hooks/useDraft';

const FORM_KEY = 'update:project';

const DEFAULT_VALUES = {
  submitterEmail: '',
  slug: '',
  changes: [],
};

export default function UpdateProjectPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Update Project — RENCI Website Change Requests';
  }, []);

  const { reset, watch, control, handleSubmit, setValue, formState } = useForm({
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
          Update Project
        </Text>

        {draft && (
          <DraftBanner
            savedAt={draft.savedAt}
            onResume={resumeDraft}
            onDiscard={discardDraft}
          />
        )}

        <UpdateProjectForm
          control={control}
          watch={watch}
          handleSubmit={handleSubmit}
          setValue={setValue}
          formState={formState}
          reset={reset}
          saveDraft={saveDraft}
          onSuccess={handleSuccess}
        />
      </Stack>
    </Container>
  );
}