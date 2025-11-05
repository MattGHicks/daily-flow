export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  project?: string; // Legacy field - keeping for backward compatibility
  linkedProjectId?: string; // Link to Monday.com project
  linkedMessageThreadId?: string; // Link to Redmine message thread
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export type Priority = 'low' | 'medium' | 'high';
