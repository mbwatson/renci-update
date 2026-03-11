/**
 * Monday.com API Service
 *
 * Column IDs (from POC — sourced from environment variables, never hardcoded):
 *
 * Parent item columns:
 *   MONDAY_COL_STATUS              = status
 *   MONDAY_COL_DATE                = date4
 *   MONDAY_COL_CONTENT_TYPE        = dropdown_mm0gr94s
 *   MONDAY_COL_DESCRIPTION         = long_text_mm0gwxya
 *   MONDAY_COL_ITEM_NAME           = text_mm0ghppz
 *   MONDAY_COL_ASSIGNED_PERSON     = person
 *   MONDAY_COL_SUBMITTER_EMAIL     = email_mm1bgmaj
 *
 * Subitem columns:
 *   (not yet defined — column IDs to be determined during RN-192 board audit)
 *
 * Board IDs:
 *   MONDAY_BOARD_ID                — single board for all submissions (Projects + People)
 */

const MONDAY_API_URL = 'https://api.monday.com/v2';

/**
 * Execute a GraphQL query/mutation against the Monday.com API.
 * @param {string} query - GraphQL query or mutation string
 * @param {object} variables - GraphQL variables
 * @returns {object} - Parsed response data
 */
async function mondayFetch(query, variables = {}) {
  const apiKey = process.env.MONDAY_API_KEY;
  if (!apiKey) {
    throw new Error('MONDAY_API_KEY is not set in environment variables');
  }

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'API-Version': '2023-10',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Monday.com API HTTP error ${response.status}: ${text}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join('; ');
    throw new Error(`Monday.com API error: ${messages}`);
  }

  return json.data;
}

/**
 * Create a parent item on a Monday.com board.
 *
 * @param {string|number} boardId - The board ID (use env var MONDAY_BOARD_ID)
 * @param {string} itemName - The item name (e.g. "Add Project - My Project Name")
 * @param {object} columnValues - Key/value map of column IDs to column value objects
 * @returns {{ id: string }} - The created item's ID
 */
export async function createItem(boardId, itemName, columnValues = {}) {
  const query = `
    mutation CreateItem($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId
        item_name: $itemName
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const variables = {
    boardId: String(boardId),
    itemName,
    columnValues: JSON.stringify(columnValues),
  };

  const data = await mondayFetch(query, variables);
  const id = data?.create_item?.id;

  if (!id) {
    throw new Error('Monday.com createItem: no item ID returned in response');
  }

  return { id };
}

/**
 * Create a subitem under an existing Monday.com parent item.
 *
 * @param {string|number} parentItemId - The parent item's ID
 * @param {string} itemName - The subitem name / action label
 * @param {object} columnValues - Key/value map of subitem column IDs to column value objects
 * @returns {{ id: string }} - The created subitem's ID
 */
export async function createSubitem(parentItemId, itemName, columnValues = {}) {
  const query = `
    mutation CreateSubitem($parentItemId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_subitem(
        parent_item_id: $parentItemId
        item_name: $itemName
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const variables = {
    parentItemId: String(parentItemId),
    itemName,
    columnValues: JSON.stringify(columnValues),
  };

  const data = await mondayFetch(query, variables);
  const id = data?.create_subitem?.id;

  if (!id) {
    throw new Error('Monday.com createSubitem: no subitem ID returned in response');
  }

  return { id };
}