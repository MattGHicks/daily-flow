/**
 * Redmine API Client
 * REST-based client for interacting with Redmine issues and projects
 */

// Redmine API Types
export interface RedmineUser {
  id: number;
  name: string;
  mail?: string;
}

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status: number;
}

export interface RedmineIssue {
  id: number;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  author: RedmineUser;
  assigned_to?: RedmineUser;
  subject: string;
  description?: string;
  created_on: string;
  updated_on: string;
  closed_on?: string;
  done_ratio?: number;
}

export interface RedmineJournal {
  id: number;
  user: RedmineUser;
  notes: string;
  created_on: string;
  private_notes: boolean;
}

export interface RedmineIssueDetailed extends RedmineIssue {
  journals?: RedmineJournal[];
}

export interface RedmineApiResponse<T = any> {
  issues?: T[];
  issue?: T;
  projects?: T[];
  total_count?: number;
  offset?: number;
  limit?: number;
  error?: string;
}

/**
 * Execute a REST API request to Redmine
 */
async function executeRedmineRequest<T = any>(
  baseUrl: string,
  endpoint: string,
  apiKey: string,
  params?: Record<string, any>
): Promise<T> {
  try {
    // Clean up base URL - remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `${cleanBaseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Redmine-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Redmine API error:', error);
    throw error;
  }
}

/**
 * Fetch issues from Redmine with optional filters
 */
export async function fetchRedmineIssues(
  baseUrl: string,
  apiKey: string,
  options?: {
    projectId?: number | string;
    assignedToId?: number | string | 'me';
    statusId?: number | string | '*' | 'open' | 'closed';
    trackerId?: number | string;
    limit?: number;
    offset?: number;
    sort?: string;
    include?: string; // e.g., 'journals,attachments'
  }
): Promise<{ issues: RedmineIssue[]; totalCount: number }> {
  try {
    const params: Record<string, any> = {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sort: options?.sort || 'updated_on:desc',
    };

    if (options?.projectId) params.project_id = options.projectId;
    if (options?.assignedToId) params.assigned_to_id = options.assignedToId;
    if (options?.statusId) params.status_id = options.statusId;
    if (options?.trackerId) params.tracker_id = options.trackerId;
    if (options?.include) params.include = options.include;

    const response = await executeRedmineRequest<RedmineApiResponse>(
      baseUrl,
      '/issues.json',
      apiKey,
      params
    );

    return {
      issues: response.issues || [],
      totalCount: response.total_count || 0,
    };
  } catch (error) {
    console.error('Error fetching Redmine issues:', error);
    return { issues: [], totalCount: 0 };
  }
}

/**
 * Fetch a single issue with full details including journals (comments)
 */
export async function fetchRedmineIssue(
  baseUrl: string,
  apiKey: string,
  issueId: number | string
): Promise<RedmineIssueDetailed | null> {
  try {
    const response = await executeRedmineRequest<RedmineApiResponse>(
      baseUrl,
      `/issues/${issueId}.json`,
      apiKey,
      { include: 'journals,attachments' }
    );

    return response.issue || null;
  } catch (error) {
    console.error('Error fetching Redmine issue:', error);
    return null;
  }
}

/**
 * Fetch all projects from Redmine
 */
export async function fetchRedmineProjects(
  baseUrl: string,
  apiKey: string
): Promise<RedmineProject[]> {
  try {
    const response = await executeRedmineRequest<RedmineApiResponse>(
      baseUrl,
      '/projects.json',
      apiKey,
      { limit: 100 }
    );

    return response.projects || [];
  } catch (error) {
    console.error('Error fetching Redmine projects:', error);
    return [];
  }
}

/**
 * Convert Redmine priority to our internal priority levels
 */
export function mapRedminePriority(
  priorityName: string
): 'low' | 'medium' | 'high' {
  const priority = priorityName.toLowerCase();

  if (priority.includes('urgent') || priority.includes('immediate') || priority.includes('critical')) {
    return 'high';
  } else if (priority.includes('high')) {
    return 'high';
  } else if (priority.includes('low')) {
    return 'low';
  }

  return 'medium'; // Normal priority
}

/**
 * Format Redmine timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 172800) return '1 day ago';
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 1209600) return '1 week ago';
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 5184000) return '1 month ago';

  return `${Math.floor(seconds / 2592000)} months ago`;
}

/**
 * Get the last message from an issue (last journal note or description)
 */
export function getLastMessage(issue: RedmineIssueDetailed): string {
  if (issue.journals && issue.journals.length > 0) {
    // Find last journal with notes
    const lastJournalWithNotes = [...issue.journals]
      .reverse()
      .find((journal) => journal.notes && journal.notes.trim().length > 0);

    if (lastJournalWithNotes) {
      return lastJournalWithNotes.notes;
    }
  }

  // Fallback to description
  return issue.description || 'No message';
}

/**
 * Check if an issue is unread (updated in last 24 hours and not closed)
 */
export function isIssueUnread(issue: RedmineIssue): boolean {
  const now = new Date();
  const updatedDate = new Date(issue.updated_on);
  const hoursSinceUpdate = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60);

  const isOpen = issue.status.name.toLowerCase() !== 'closed' &&
                 issue.status.name.toLowerCase() !== 'resolved';

  return isOpen && hoursSinceUpdate < 24;
}
