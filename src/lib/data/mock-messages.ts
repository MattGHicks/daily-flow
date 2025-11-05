import { MessageThread } from '@/types/message';

// Mock Redmine message threads data
export const mockMessageThreads: MessageThread[] = [
  {
    id: 't1',
    client: 'Acme Inc.',
    subject: 'Website Redesign Feedback',
    lastMessage: 'The new mockups look great! Just a few minor changes...',
    timestamp: '2 hours ago',
    unread: true,
    priority: 'high',
  },
  {
    id: 't2',
    client: 'TechStart',
    subject: 'Authentication Bug Report',
    lastMessage: 'Users are experiencing login issues after the update',
    timestamp: '5 hours ago',
    unread: true,
    priority: 'high',
  },
  {
    id: 't3',
    client: 'WebCorp',
    subject: 'Project Timeline Discussion',
    lastMessage: 'Thanks for the update. The timeline works perfectly.',
    timestamp: '1 day ago',
    unread: false,
    priority: 'medium',
  },
  {
    id: 't4',
    client: 'DesignCo',
    subject: 'New Feature Request',
    lastMessage: 'We\'d like to add a dark mode option to the dashboard',
    timestamp: '2 days ago',
    unread: false,
    priority: 'low',
  },
  {
    id: 't5',
    client: 'Marketing Team',
    subject: 'Campaign Assets',
    lastMessage: 'The final assets look amazing, thank you!',
    timestamp: '3 days ago',
    unread: false,
    priority: 'low',
  },
];
