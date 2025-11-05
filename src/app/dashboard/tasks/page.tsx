'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/features/kanban/kanban-board';
import { Column } from '@/types/kanban';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { LinkSelectorModal } from '@/components/features/tasks/link-selector-modal';

// Sample task data - can be linked to Monday.com projects and Redmine threads
const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      {
        id: '1',
        title: 'Implement Monday.com API integration',
        description: 'Connect to Monday.com API to sync project data automatically',
        priority: 'high',
        assignee: 'Matt',
        dueDate: '2025-11-10',
        tags: ['API', 'Integration'],
        project: 'Daily Flow',
      },
      {
        id: '2',
        title: 'Design user settings page',
        description: 'Create settings page with theme customization and preferences',
        priority: 'medium',
        assignee: 'Matt',
        tags: ['UI', 'Design'],
        project: 'Daily Flow',
      },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: '3',
        title: 'Set up Google Calendar sync',
        description: 'Integrate Google Calendar API for bi-directional event sync',
        priority: 'high',
        assignee: 'Matt',
        dueDate: '2025-11-08',
        tags: ['API', 'Calendar'],
        project: 'Daily Flow',
        linkedProjectId: 'p1', // Linked to Acme Website Redesign
      },
      {
        id: '4',
        title: 'Implement Redmine integration',
        description: 'Connect to Redmine API to fetch client message threads',
        priority: 'high',
        assignee: 'Matt',
        dueDate: '2025-11-09',
        tags: ['API', 'Messages'],
        project: 'Daily Flow',
        linkedThreadId: 't1', // Linked to Acme Inc. thread
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: '5',
        title: 'Build Kanban board component',
        description: 'Create drag-and-drop Kanban board with dnd-kit',
        priority: 'high',
        assignee: 'Matt',
        dueDate: '2025-11-06',
        tags: ['UI', 'Component'],
        project: 'Daily Flow',
        linkedProjectId: 'p2', // Linked to TechStart Mobile App
        linkedThreadId: 't2', // Linked to TechStart thread
      },
      {
        id: '6',
        title: 'Add Spotify player widget',
        description: 'Integrate Spotify Web API for music playback control',
        priority: 'medium',
        assignee: 'Matt',
        tags: ['API', 'Music'],
        project: 'Daily Flow',
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: '7',
        title: 'Dashboard layout and navigation',
        description: 'Responsive dashboard with sidebar and animated components',
        priority: 'low',
        assignee: 'Matt',
        tags: ['UI', 'Complete'],
        project: 'Daily Flow',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: '8',
        title: 'Initial Next.js setup',
        description: 'Configure Next.js 15 with TypeScript and Tailwind CSS',
        priority: 'high',
        assignee: 'Matt',
        tags: ['Setup', 'Complete'],
        project: 'Daily Flow',
      },
      {
        id: '9',
        title: 'Install shadcn/ui components',
        description: 'Set up component library and design system',
        priority: 'medium',
        assignee: 'Matt',
        tags: ['Setup', 'Complete'],
        project: 'Daily Flow',
      },
    ],
  },
];

export default function TasksPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = columns
    .flatMap((col) => col.tasks)
    .find((task) => task.id === selectedTaskId);

  const handleTaskLinkClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setLinkModalOpen(true);
  };

  const handleLinkProject = (projectId: string) => {
    if (!selectedTaskId) return;

    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === selectedTaskId ? { ...task, linkedProjectId: projectId } : task
        ),
      }))
    );
  };

  const handleLinkThread = (threadId: string) => {
    if (!selectedTaskId) return;

    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === selectedTaskId
            ? { ...task, linkedMessageThreadId: threadId }
            : task
        ),
      }))
    );
  };

  const handleUnlinkProject = () => {
    if (!selectedTaskId) return;

    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === selectedTaskId ? { ...task, linkedProjectId: undefined } : task
        ),
      }))
    );
  };

  const handleUnlinkThread = () => {
    if (!selectedTaskId) return;

    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === selectedTaskId
            ? { ...task, linkedMessageThreadId: undefined }
            : task
        ),
      }))
    );
  };

  return (
    <>
      <div className="p-6">
        <AnimatedContainer animation="slideUp">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Tasks</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop tasks between columns to update their status
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {columns.reduce((acc, col) => acc + col.tasks.length, 0)} total tasks
                </span>
              </div>
            </div>
          </div>

          <KanbanBoard
            columns={columns}
            onColumnsChange={setColumns}
            onTaskLinkClick={handleTaskLinkClick}
          />
        </AnimatedContainer>
      </div>

      <LinkSelectorModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        currentProjectId={selectedTask?.linkedProjectId}
        currentThreadId={selectedTask?.linkedMessageThreadId}
        onLinkProject={handleLinkProject}
        onLinkThread={handleLinkThread}
        onUnlinkProject={handleUnlinkProject}
        onUnlinkThread={handleUnlinkThread}
      />
    </>
  );
}
