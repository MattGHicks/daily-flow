// Monday.com Project (read-only)
export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  lastUpdated?: string;
}

export type ProjectStatus =
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'planning'
  | 'archived';

export const projectStatusColors: Record<ProjectStatus, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  'on-hold': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  planning: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  archived: 'bg-muted text-muted-foreground border-border',
};
