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
  linkedProjectName?: string; // Monday.com project name
  linkedProjectUrl?: string; // Monday.com project URL
  linkedMessageThreadId?: string; // Link to Redmine message thread
  linkedMessageThreadName?: string; // Redmine thread name
  linkedMessageThreadUrl?: string; // Redmine thread URL
  stageId?: string; // Link to custom TaskStage
  status?: string; // Stage key for backward compatibility
  archived?: boolean; // Whether the task is archived
  archivedAt?: string; // When the task was archived
}

export interface TaskStage {
  id: string;
  key: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  isDefault: boolean;
  canDelete: boolean;
}

export interface Column {
  id: string;
  key?: string; // Stage key
  title: string;
  color?: string;
  icon?: string;
  tasks: Task[];
  canDelete?: boolean;
}

export type Priority = 'low' | 'medium' | 'high';
