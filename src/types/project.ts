// Monday.com Project (read-only)
export interface Project {
  id: string;
  title: string;
  status: string; // Can be any Monday.com status
  lastUpdated?: string;
  // Monday-specific fields
  boardName?: string; // Which Monday.com board this is from
  groupName?: string; // Group within the board
  mondayItemId?: string; // Original Monday.com item ID
  mondayBoardId?: string; // Monday.com board ID
  mondayUrl?: string; // Direct link to Monday.com item
  mondayStatus?: string; // Original Monday.com status label
  mondayStatusColor?: string | null; // Monday.com status color
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
