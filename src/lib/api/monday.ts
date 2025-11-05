/**
 * Monday.com API Client
 * GraphQL-based client for interacting with Monday.com boards and items
 */

const MONDAY_API_URL = 'https://api.monday.com/v2';

// Monday.com API Types
export interface MondayUser {
  id: string;
  name: string;
  email: string;
  account?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface MondayGroup {
  id: string;
  title: string;
  color?: string;
}

export interface MondayColumnValue {
  id: string;
  text?: string;
  type: string;
  value?: string;
}

export interface MondayItem {
  id: string;
  name: string;
  group: {
    id: string;
    title: string;
  };
  column_values: MondayColumnValue[];
  updated_at: string;
}

export interface MondayColumn {
  id: string;
  title: string;
  type: string;
  settings_str?: string; // JSON string containing column settings
}

export interface MondayBoard {
  id: string;
  name: string;
  groups: MondayGroup[];
  columns?: MondayColumn[];
  items_page?: {
    cursor?: string;
    items: MondayItem[];
  };
}

export interface MondayApiResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
  error_code?: string;
  status_code?: number;
}

/**
 * Execute a GraphQL query against Monday.com API
 */
async function executeMondayQuery<T = any>(
  query: string,
  apiKey: string,
  variables?: Record<string, any>
): Promise<MondayApiResponse<T>> {
  try {
    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query,
        variables: variables || {},
      }),
    });

    if (!response.ok) {
      return {
        errors: [{ message: `HTTP ${response.status}: ${response.statusText}` }],
        status_code: response.status,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
    };
  }
}

/**
 * Get the current user's information from Monday.com
 */
export async function getCurrentUser(apiKey: string): Promise<MondayUser | null> {
  const query = `
    query {
      me {
        id
        name
        email
        account {
          id
          name
          slug
        }
      }
    }
  `;

  const response = await executeMondayQuery<{ me: MondayUser }>(query, apiKey);

  if (response.errors || !response.data) {
    console.error('Error fetching current user:', response.errors);
    return null;
  }

  return response.data.me;
}

/**
 * Fetch all boards accessible to the user
 */
export async function fetchAllBoards(apiKey: string): Promise<MondayBoard[]> {
  const query = `
    query {
      boards(limit: 100) {
        id
        name
        groups {
          id
          title
          color
        }
      }
    }
  `;

  const response = await executeMondayQuery<{ boards: MondayBoard[] }>(query, apiKey);

  if (response.errors || !response.data) {
    console.error('Error fetching boards:', response.errors);
    return [];
  }

  return response.data.boards;
}

/**
 * Fetch specific boards by name
 */
export async function fetchBoardsByName(
  apiKey: string,
  boardNames: string[]
): Promise<MondayBoard[]> {
  const allBoards = await fetchAllBoards(apiKey);
  return allBoards.filter((board) => boardNames.includes(board.name));
}

/**
 * Fetch items from a specific board filtered by user assignment
 */
export async function fetchBoardItems(
  apiKey: string,
  boardId: string,
  userId?: string
): Promise<{ items: MondayItem[]; board: MondayBoard }> {
  // Build the query with optional user filtering
  const query = `
    query GetBoardItems($boardId: ID!, $limit: Int!) {
      boards(ids: [$boardId]) {
        id
        name
        columns {
          id
          title
          type
          settings_str
        }
        items_page(limit: $limit) {
          cursor
          items {
            id
            name
            group {
              id
              title
            }
            column_values {
              id
              text
              type
              value
            }
            updated_at
          }
        }
      }
    }
  `;

  const variables = {
    boardId: boardId,
    limit: 500, // Maximum items per page
  };

  const response = await executeMondayQuery<{ boards: MondayBoard[] }>(
    query,
    apiKey,
    variables
  );

  if (response.errors || !response.data || !response.data.boards[0]) {
    console.error('Error fetching board items:', response.errors);
    return { items: [], board: { id: boardId, name: '', groups: [], columns: [] } };
  }

  const board = response.data.boards[0];
  const items = board.items_page?.items || [];

  // If userId is provided, filter items where user is assigned
  const filteredItems = userId
    ? items.filter((item) => {
        // Find people/person columns
        const peopleColumns = item.column_values.filter(
          (col) => col.type === 'multiple-person' || col.type === 'people'
        );

        // Check if user is assigned in any people column
        return peopleColumns.some((col) => {
          if (!col.value) return false;
          try {
            const value = JSON.parse(col.value);
            const personIds = value.personsAndTeams?.map((p: any) => p.id.toString()) || [];
            return personIds.includes(userId.toString());
          } catch {
            return false;
          }
        });
      })
    : items;

  return { items: filteredItems, board };
}

/**
 * Fetch projects from specific boards with user filtering
 */
export async function fetchMondayProjects(
  apiKey: string,
  boardNames: string[],
  options?: {
    excludeGroups?: Record<string, string[]>; // board name -> group titles to exclude
  }
): Promise<{ board: MondayBoard; items: MondayItem[] }[]> {
  try {
    // Get current user
    const currentUser = await getCurrentUser(apiKey);
    if (!currentUser) {
      throw new Error('Failed to get current user from Monday.com');
    }

    // Fetch specified boards
    const boards = await fetchBoardsByName(apiKey, boardNames);
    if (boards.length === 0) {
      console.warn('No boards found with the specified names:', boardNames);
      return [];
    }

    // Fetch items for each board
    const results = await Promise.all(
      boards.map(async (boardInfo) => {
        const { items, board: fullBoard } = await fetchBoardItems(
          apiKey,
          boardInfo.id,
          currentUser.id
        );

        // Filter out excluded groups if specified
        let filteredItems = items;
        if (options?.excludeGroups && options.excludeGroups[boardInfo.name]) {
          const excludedGroupTitles = options.excludeGroups[boardInfo.name];
          filteredItems = items.filter(
            (item) => !excludedGroupTitles.includes(item.group.title)
          );
        }

        return { board: fullBoard, items: filteredItems };
      })
    );

    return results;
  } catch (error) {
    console.error('Error fetching Monday.com projects:', error);
    throw error;
  }
}

/**
 * Get the status column value from a Monday.com item
 * Returns both the label and color information
 */
export function getItemStatus(
  item: MondayItem,
  boardColumns: MondayColumn[]
): {
  label: string;
  color: string | null;
} {
  // Look for status61 column (Project Status) or status column on QA Board
  const statusColumn = item.column_values.find(
    (col) => col.id === 'status61' || (col.id === 'status' && col.type === 'status')
  );

  if (!statusColumn || !statusColumn.value) {
    // Fallback to text if available
    return {
      label: statusColumn?.text || 'No Status',
      color: null,
    };
  }

  try {
    // Parse the status value to get the index
    const statusData = JSON.parse(statusColumn.value);
    const statusIndex = statusData.index;

    // Find the column definition to get labels and colors
    const columnDef = boardColumns.find((col) => col.id === statusColumn.id);

    if (columnDef && columnDef.settings_str) {
      // Parse the settings to get status labels
      const settings = JSON.parse(columnDef.settings_str);

      // Monday.com status settings have a "labels" object mapping index to {name, color}
      if (settings.labels && settings.labels[statusIndex.toString()]) {
        const statusLabel = settings.labels[statusIndex.toString()];
        return {
          label: statusLabel || statusColumn.text || 'No Status',
          color: settings.labels_colors?.[statusIndex.toString()]?.color || null,
        };
      }
    }

    // Fallback to text value
    return {
      label: statusColumn.text || 'No Status',
      color: null,
    };
  } catch (error) {
    console.error('Error parsing status:', error);
    // Fallback to text if JSON parsing fails
    return {
      label: statusColumn.text || 'No Status',
      color: null,
    };
  }
}

/**
 * Get specific column value by column ID
 */
export function getColumnValue(item: MondayItem, columnId: string): string {
  const column = item.column_values.find((col) => col.id === columnId);
  return column?.text || '';
}

/**
 * Convert Monday.com status color (hex) to Tailwind-compatible color classes
 * Monday.com provides hex colors like #579bfc, #fdab3d, etc.
 */
export function getMondayColorClasses(mondayColor: string | null): string {
  if (!mondayColor) {
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
  }

  // Map Monday.com hex colors to similar Tailwind classes
  // Based on common Monday.com status colors
  const hexColorMap: Record<string, string> = {
    // Blue shades (First Concept, Revision 1)
    '#579bfc': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    '#007eb5': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    '#0086c0': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',

    // Orange shades (Working on it)
    '#fdab3d': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
    '#ff9000': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',

    // Gray shades (Assigned)
    '#c4c4c4': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
    '#808080': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',

    // Green shades (Done, Complete)
    '#00c875': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    '#9cd326': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    '#037f4c': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',

    // Red shades (Stuck, Critical)
    '#df2f4a': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
    '#e44258': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',

    // Purple/Pink shades (Revision 4+)
    '#e484bd': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-700',
    '#a25ddc': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
    '#784bd1': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',

    // Yellow shades
    '#ffcb00': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    '#cab641': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  };

  // Return exact match or fallback to gray
  return hexColorMap[mondayColor.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
}
