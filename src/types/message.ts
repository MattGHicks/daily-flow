// Redmine Message Thread
export interface MessageThread {
  id: string;
  client: string;
  subject: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
  priority?: 'low' | 'medium' | 'high';
}
