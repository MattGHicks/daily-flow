'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoardImproved } from '@/components/features/kanban/kanban-board-improved';
import { Column, Task, TaskStage } from '@/types/kanban';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { LinkSelectorModal } from '@/components/features/tasks/link-selector-modal';
import { CreateTaskModal } from '@/components/features/tasks/create-task-modal';
import { EditTaskModal } from '@/components/features/tasks/edit-task-modal';
import { StageManager } from '@/components/features/tasks/stage-manager';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListTodo, Settings2, Archive } from 'lucide-react';
import Link from 'next/link';

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
        linkedProjectId: 'p1',
        linkedProjectName: 'Acme Website Redesign',
        linkedProjectUrl: 'https://revize.monday.com/boards/1234567890/views/195126247/pulses/p1',
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
        linkedMessageThreadId: 't1',
        linkedMessageThreadName: 'Acme Inc. - Website Updates',
        linkedMessageThreadUrl: 'https://redmine.revize.com/issues/t1',
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
        linkedProjectId: 'p2',
        linkedProjectName: 'TechStart Mobile App',
        linkedProjectUrl: 'https://revize.monday.com/boards/1234567890/views/195126247/pulses/p2',
        linkedMessageThreadId: 't2',
        linkedMessageThreadName: 'TechStart - App Development',
        linkedMessageThreadUrl: 'https://redmine.revize.com/issues/t2',
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

function TasksPageContent() {
  const searchParams = useSearchParams();
  const [columns, setColumns] = useState<Column[]>([]);
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDefaultStatus, setCreateModalDefaultStatus] = useState('backlog');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stageManagerOpen, setStageManagerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTask = columns
    .flatMap((col) => col.tasks)
    .find((task) => task.id === selectedTaskId);

  // Fetch stages from database
  const fetchStages = async () => {
    try {
      const response = await fetch('/api/task-stages');
      const result = await response.json();

      if (result.success) {
        setStages(result.data);
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching stages:', error);
      return [];
    }
  };

  // Fetch tasks and stages from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch stages first
        const stageData = await fetchStages();

        // Then fetch tasks
        const tasksResponse = await fetch('/api/tasks');
        const tasksResult = await tasksResponse.json();

        if (tasksResult.success && stageData.length > 0) {
          // Group tasks by status/stage
          const tasksByStatus: Record<string, Task[]> = {};

          // Initialize with empty arrays for each stage
          stageData.forEach((stage: TaskStage) => {
            tasksByStatus[stage.key] = [];
          });

          // Sort tasks into their stages
          tasksResult.data.forEach((task: any) => {
            const stageKey = task.status || 'backlog';
            if (tasksByStatus[stageKey]) {
              tasksByStatus[stageKey].push(task);
            } else {
              // If stage doesn't exist, put in backlog
              tasksByStatus['backlog']?.push(task);
            }
          });

          // Convert stages to columns with tasks
          const loadedColumns: Column[] = stageData.map((stage: TaskStage) => ({
            id: stage.key,
            key: stage.key,
            title: stage.name,
            color: stage.color,
            icon: stage.icon,
            tasks: tasksByStatus[stage.key] || [],
            canDelete: stage.canDelete,
          }));

          setColumns(loadedColumns);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save tasks to database whenever columns change (debounced)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const saveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Flatten tasks with updated order and status
        const updates = columns.flatMap((col) =>
          col.tasks.map((task, index) => ({
            id: task.id,
            status: col.id,
            order: index,
            title: task.title,
            description: task.description,
            priority: task.priority,
            assignee: task.assignee,
            dueDate: task.dueDate,
            tags: task.tags,
            project: task.project,
            linkedProjectId: task.linkedProjectId,
            linkedProjectName: task.linkedProjectName,
            linkedProjectUrl: task.linkedProjectUrl,
            linkedMessageThreadId: task.linkedMessageThreadId,
            linkedMessageThreadName: task.linkedMessageThreadName,
            linkedMessageThreadUrl: task.linkedMessageThreadUrl,
          }))
        );

        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        });
      } catch (error) {
        console.error('Error saving tasks:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
  }, [columns, isLoading]);

  // Auto-open create modal if ?create=true query param is present
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleTaskLinkClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setLinkModalOpen(true);
  };

  const handleLinkProject = async (projectId: string) => {
    if (!selectedTaskId) return;

    try {
      // Fetch project details to get the name and URL
      const response = await fetch('/api/monday/projects');
      const result = await response.json();

      if (result.success) {
        const project = result.data.find((p: any) => p.id === projectId);
        if (project) {
          setColumns((cols) =>
            cols.map((col) => ({
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === selectedTaskId
                  ? {
                      ...task,
                      linkedProjectId: projectId,
                      linkedProjectName: project.name,
                      linkedProjectUrl: project.mondayUrl
                    }
                  : task
              ),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error linking project:', error);
      // Fallback to just setting the ID
      setColumns((cols) =>
        cols.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === selectedTaskId ? { ...task, linkedProjectId: projectId } : task
          ),
        }))
      );
    }
  };

  const handleLinkThread = async (threadId: string) => {
    if (!selectedTaskId) return;

    try {
      // Fetch thread details to get the name and URL
      const response = await fetch('/api/redmine/issues');
      const result = await response.json();

      if (result.success) {
        const thread = result.data.find((t: any) => t.id === threadId);
        if (thread) {
          setColumns((cols) =>
            cols.map((col) => ({
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === selectedTaskId
                  ? {
                      ...task,
                      linkedMessageThreadId: threadId,
                      linkedMessageThreadName: `${thread.client} - ${thread.subject}`,
                      linkedMessageThreadUrl: thread.redmineUrl
                    }
                  : task
              ),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error linking thread:', error);
      // Fallback to just setting the ID
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
    }
  };

  const handleUnlinkProject = () => {
    if (!selectedTaskId) return;

    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === selectedTaskId
            ? {
                ...task,
                linkedProjectId: undefined,
                linkedProjectName: undefined,
                linkedProjectUrl: undefined
              }
            : task
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
            ? {
                ...task,
                linkedMessageThreadId: undefined,
                linkedMessageThreadName: undefined,
                linkedMessageThreadUrl: undefined
              }
            : task
        ),
      }))
    );
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (result.success) {
        const newTask = result.data;

        // Add the new task to the appropriate column
        setColumns((cols) =>
          cols.map((col) =>
            col.id === newTask.status
              ? { ...col, tasks: [...col.tasks, newTask] }
              : col
          )
        );
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskEditClick = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleAddTaskFromColumn = (columnId: string) => {
    setCreateModalDefaultStatus(columnId);
    setCreateModalOpen(true);
  };

  const handleUpdateTask = (taskId: string, updatedData: Partial<Task>) => {
    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedData } : task
        ),
      }))
    );
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskDelete = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove the task from columns
        setColumns((cols) =>
          cols.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== task.id),
          }))
        );
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  return (
    <>
      <div className="p-6">
        <AnimatedContainer animation="slideUp">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tasks</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop tasks between columns to update their status
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isSaving && (
                  <span className="text-xs text-muted-foreground">Saving...</span>
                )}
                <span className="text-sm text-muted-foreground">
                  {columns.reduce((acc, col) => acc + col.tasks.length, 0)} total tasks
                </span>
                <Link href="/dashboard/tasks/archive">
                  <Button variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    View Archive
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setStageManagerOpen(true)}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Stages
                </Button>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading tasks...</div>
            </div>
          ) : (
            <KanbanBoardImproved
              columns={columns}
              onColumnsChange={setColumns}
              onTaskLinkClick={handleTaskLinkClick}
              onTaskEditClick={handleTaskEditClick}
              onTaskDeleteClick={handleTaskDelete}
              onAddTaskFromColumn={handleAddTaskFromColumn}
            />
          )}
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

      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateTask={handleCreateTask}
        defaultStatus={createModalDefaultStatus}
        stages={stages}
      />

      <EditTaskModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        task={editingTask}
        onUpdateTask={handleUpdateTask}
      />

      <StageManager
        open={stageManagerOpen}
        onOpenChange={setStageManagerOpen}
        stages={stages}
        onRefresh={async () => {
          await fetchStages();
          // Reload tasks and stages
          const stageData = await fetchStages();
          const tasksResponse = await fetch('/api/tasks');
          const tasksResult = await tasksResponse.json();

          if (tasksResult.success && stageData.length > 0) {
            // Group tasks by status/stage
            const tasksByStatus: Record<string, Task[]> = {};

            // Initialize with empty arrays for each stage
            stageData.forEach((stage: TaskStage) => {
              tasksByStatus[stage.key] = [];
            });

            // Sort tasks into their stages
            tasksResult.data.forEach((task: any) => {
              const stageKey = task.status || 'backlog';
              if (tasksByStatus[stageKey]) {
                tasksByStatus[stageKey].push(task);
              } else {
                // If stage doesn't exist, put in backlog
                tasksByStatus['backlog']?.push(task);
              }
            });

            // Convert stages to columns with tasks
            const loadedColumns: Column[] = stageData.map((stage: TaskStage) => ({
              id: stage.key,
              key: stage.key,
              title: stage.name,
              color: stage.color,
              icon: stage.icon,
              tasks: tasksByStatus[stage.key] || [],
              canDelete: stage.canDelete,
            }));

            setColumns(loadedColumns);
          }
        }}
      />
    </>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <TasksPageContent />
    </Suspense>
  );
}
