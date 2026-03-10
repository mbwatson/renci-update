// frontend/src/hooks/useDraft.js
import { useState, useEffect, useRef, useCallback } from 'react';

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function storageKey(formKey) {
  return `draft:${formKey}`;
}

function readDraft(formKey) {
  try {
    const raw = localStorage.getItem(storageKey(formKey));
    if (!raw) return null;
    const { values, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(storageKey(formKey));
      return null;
    }
    return { values, savedAt };
  } catch {
    return null;
  }
}

function writeDraft(formKey, values) {
  try {
    localStorage.setItem(
      storageKey(formKey),
      JSON.stringify({ values, savedAt: Date.now() })
    );
  } catch {
    // localStorage unavailable or full — fail silently
  }
}

function clearDraft(formKey) {
  try {
    localStorage.removeItem(storageKey(formKey));
  } catch {
    // fail silently
  }
}

/**
 * useDraft
 * Manages localStorage draft persistence for a form.
 *
 * @param {string} formKey - Unique key per form type e.g. 'add:project'
 * @param {function} reset  - RHF reset function to populate form from draft
 *
 * Returns:
 *   draft       - The stored draft ({ values, savedAt }) or null
 *   saveDraft   - Debounced function to call with current form values on change
 *   resumeDraft - Populates the form from the draft and clears the banner
 *   discardDraft - Clears localStorage and dismisses the banner
 *
 * Usage:
 *   const { draft, saveDraft, resumeDraft, discardDraft } = useDraft('add:project', reset);
 *   // Wire saveDraft into RHF watch:
 *   useEffect(() => {
 *     const sub = watch((values) => saveDraft(values));
 *     return () => sub.unsubscribe();
 *   }, [watch, saveDraft]);
 */
export function useDraft(formKey, reset) {
  const [draft, setDraft] = useState(() => readDraft(formKey));
  const debounceRef = useRef(null);

  const saveDraft = useCallback((values) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      writeDraft(formKey, values);
    }, 1000);
  }, [formKey]);

  const resumeDraft = useCallback(() => {
    if (!draft) return;
    reset(draft.values);
    setDraft(null);
  }, [draft, reset]);

  const discardDraft = useCallback(() => {
    clearDraft(formKey);
    setDraft(null);
  }, [formKey]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { draft, saveDraft, resumeDraft, discardDraft };
}