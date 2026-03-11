// backend/routes/projects.js

import express from 'express';
import { validate } from '../schemas/validate.js';
import { getProjects } from '../services/graphql.js';
import { createItem, createSubitem } from '../services/monday.js';

const router = express.Router();

// ── GET /api/projects ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const projects = await getProjects();
    return res.json(projects);
  } catch (err) {
    if (err.code === 'VPN_REQUIRED') {
      return res.status(503).json({ code: 'VPN_REQUIRED', message: err.message });
    }
    console.error('GET /api/projects error:', err);
    return res.status(500).json({ message: 'Failed to load projects.' });
  }
});

// ── POST /api/projects ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const result = validate('project.add', req.body);
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }

  const {
    submitterEmail,
    name,
    slug,
    description,
    renciRole,
    owningGroup,
    people,
    fundingOrgs,
    partnerOrgs,
    websites,
    reviewRequests = [],
  } = req.body;

  try {
    const boardId = process.env.MONDAY_BOARD_ID;
    const today = new Date().toISOString().slice(0, 10);

    const formatTags = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return '(none)';
      return arr
        .map((v) => (typeof v === 'object' && v !== null ? v.name : v))
        .join(', ');
    };

    const formatWebsites = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return '(none)';
      return arr.map((w) => w.url).join('\n');
    };

    const descriptionText = [
      `Submitter: ${submitterEmail}`,
      `Name: ${name || '(not provided)'}`,
      `Slug: ${slug || '(not provided)'}`,
      `Description: ${description || '(not provided)'}`,
      `RENCI Role: ${renciRole || '(not provided)'}`,
      `Owning Group: ${owningGroup || '(not provided)'}`,
      `Contributors: ${formatTags(people)}`,
      `Funding Orgs: ${formatTags(fundingOrgs)}`,
      `Partner Orgs: ${formatTags(partnerOrgs)}`,
      `Websites:\n${formatWebsites(websites)}`,
    ].join('\n');

    const columnValues = {
      [process.env.MONDAY_COL_STATUS]: { label: 'New' },
      [process.env.MONDAY_COL_DATE]: { date: today },
      [process.env.MONDAY_COL_CONTENT_TYPE]: { labels: ['Project'] },
      [process.env.MONDAY_COL_DESCRIPTION]: { text: descriptionText },
      [process.env.MONDAY_COL_SUBMITTER_EMAIL]: { email: submitterEmail, text: submitterEmail },
    };

    const itemName = `Add Project - ${name?.trim() || '(unnamed)'}`;
    const item = await createItem(boardId, itemName, columnValues);

    const subitems = [];

    const publishRequired = [
      { key: name, label: 'Project Name' },
      { key: owningGroup, label: 'Owning Group' },
      { key: description, label: 'Description' },
      { key: renciRole, label: "RENCI's Role" },
    ];
    for (const { key, label } of publishRequired) {
      if (!key || (typeof key === 'string' && key.trim() === '')) {
        subitems.push(`Follow up: ${label} not provided`);
      }
    }

    const importantFields = [
      { key: Array.isArray(people) && people.length > 0,      label: 'Contributors' },
      { key: Array.isArray(fundingOrgs) && fundingOrgs.length > 0, label: 'Funding Organizations' },
      { key: Array.isArray(partnerOrgs) && partnerOrgs.length > 0, label: 'Partner Organizations' },
      { key: slug?.trim(), label: 'Slug' },
    ];
    for (const { key, label } of importantFields) {
      if (!key) subitems.push(`Follow up: ${label} not provided`);
    }

    const reviewFieldLabels = {
      name: 'Project Name',
      description: 'Description',
      renciRole: "RENCI's Role",
      slug: 'Slug',
    };
    for (const fieldName of reviewRequests) {
      const label = reviewFieldLabels[fieldName];
      if (label) subitems.push(`Review: ${label}`);
    }

    for (const subitemName of subitems) {
      await createSubitem(item.id, subitemName, {});
    }

    return res.status(200).json({ success: true, itemId: item.id });
  } catch (err) {
    if (err.code === 'VPN_REQUIRED') {
      return res.status(503).json({ code: 'VPN_REQUIRED', message: err.message });
    }
    console.error('POST /api/projects error:', err);
    return res.status(500).json({ message: 'Failed to create Monday item.' });
  }
});

// ── POST /api/projects/update ─────────────────────────────────────────────────
router.post('/update', async (req, res) => {
  const result = validate('project.update', req.body);
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }

  const { submitterEmail, slug, changes } = req.body;

  const changeSummary = changes
    .map((c) => `${c.label || c.field}: ${formatChangeValue(c.value)}`)
    .join('\n');

  const descriptionText = [
    `Submitter: ${submitterEmail}`,
    `Slug: ${slug}`,
    '',
    'Requested Changes:',
    changeSummary,
  ].join('\n');

  const columnValues = {
    [process.env.MONDAY_COL_STATUS]: { label: 'New' },
    [process.env.MONDAY_COL_DATE]: { date: new Date().toISOString().slice(0, 10) },
    [process.env.MONDAY_COL_CONTENT_TYPE]: { labels: ['Project'] },
    [process.env.MONDAY_COL_DESCRIPTION]: { text: descriptionText },
    [process.env.MONDAY_COL_SUBMITTER_EMAIL]: { email: submitterEmail, text: submitterEmail },
  };

  try {
    const item = await createItem(
      process.env.MONDAY_BOARD_ID,
      `Update Project - ${slug}`,
      columnValues
    );

    await Promise.all(
      changes.map((change) => {
        const subitemName = `${change.label || change.field}: ${summarizeValue(change.value)}`;
        return createSubitem(item.id, subitemName, {});
      })
    );

    return res.status(201).json({ success: true, itemId: item.id });
  } catch (err) {
    if (err.code === 'VPN_REQUIRED') {
      return res.status(503).json({ code: 'VPN_REQUIRED', message: err.message });
    }
    console.error('POST /api/projects/update error:', err);
    return res.status(500).json({ message: 'Failed to submit request. Please try again.' });
  }
});

// ── POST /api/projects/archive ────────────────────────────────────────────────
router.post('/archive', async (req, res) => {
  const result = validate('project.archive', req.body);
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }

  const { submitterEmail, slug, name, reason } = req.body;

  try {
    const boardId = process.env.MONDAY_BOARD_ID;
    const today = new Date().toISOString().slice(0, 10);

    const descriptionText = [
      `Submitter: ${submitterEmail}`,
      `Project: ${name || slug}`,
      `Slug: ${slug}`,
      `Reason: ${reason}`,
    ].join('\n');

    const columnValues = {
      [process.env.MONDAY_COL_STATUS]: { label: 'New' },
      [process.env.MONDAY_COL_DATE]: { date: today },
      [process.env.MONDAY_COL_CONTENT_TYPE]: { labels: ['Project'] },
      [process.env.MONDAY_COL_DESCRIPTION]: { text: descriptionText },
      [process.env.MONDAY_COL_SUBMITTER_EMAIL]: { email: submitterEmail, text: submitterEmail },
    };

    const item = await createItem(boardId, `Archive Project - ${name?.trim() || slug}`, columnValues);

    return res.status(200).json({ success: true, itemId: item.id });
  } catch (err) {
    if (err.code === 'VPN_REQUIRED') {
      return res.status(503).json({ code: 'VPN_REQUIRED', message: err.message });
    }
    console.error('POST /api/projects/archive error:', err);
    return res.status(500).json({ message: 'Failed to create Monday item.' });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatChangeValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return '(none)';
    return value
      .map((v) => (typeof v === 'object' ? v.name || v.url || JSON.stringify(v) : String(v)))
      .join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    if ('add' in value || 'remove' in value) {
      const parts = [];
      if (value.remove?.length) parts.push(`remove: ${value.remove.join(', ')}`);
      if (value.add?.length) parts.push(`add: ${formatChangeValue(value.add)}`);
      return parts.length ? parts.join('; ') : '(no changes)';
    }
    return value.name || value.url || JSON.stringify(value);
  }
  return String(value ?? '');
}

function summarizeValue(value) {
  const full = formatChangeValue(value);
  return full.length > 80 ? full.slice(0, 77) + '...' : full;
}

export default router;