// Redmine Message Thread
export interface MessageThread {
  id: string;
  client: string;
  subject: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
  priority?: 'low' | 'medium' | 'high';
  // Optional Redmine-specific fields
  redmineIssueId?: number;
  redmineProjectId?: number;
  redmineStatus?: string;
  redmineTracker?: string;
  redmineUrl?: string;
  assignedTo?: string;
  author?: string;
  createdOn?: string;
  updatedOn?: string;
}
