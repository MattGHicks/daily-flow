'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/features/kanban/kanban-board';
import { Column, Task } from '@/types/kanban';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { LinkSelectorModal } from '@/components/features/tasks/link-selector-modal';
import { CreateTaskModal } from '@/components/features/tasks/create-task-modal';
import { StageManagementModal } from '@/components/features/tasks/stage-management-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings2 } from 'lucide-react';

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [columns, setColumns] = useState<Column[]>([]);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTask = columns
    .flatMap((col) => col.tasks)
    .find((task) => task.id === selectedTaskId);

  // Fetch stages and tasks from database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stages and tasks in parallel
        const [stagesResponse, tasksResponse] = await Promise.all([
          fetch('/api/stages'),
          fetch('/api/tasks'),
        ]);

        const stagesResult = await stagesResponse.json();
        const tasksResult = await tasksResponse.json();

        if (stagesResult.success && tasksResult.success) {
          // Convert flat task list to column structure
          const tasksByStatus: Record<string, Task[]> = {};

          // Initialize task arrays for each stage
          stagesResult.data.forEach((stage: any) => {
            tasksByStatus[stage.id] = [];
          });

          // Group tasks by status
          tasksResult.data.forEach((task: any) => {
            if (tasksByStatus[task.status]) {
              tasksByStatus[task.status].push(task);
            }
          });

          // Create columns from stages
          const loadedColumns: Column[] = stagesResult.data.map((stage: any) => ({
            id: stage.id,
            title: stage.title,
            tasks: tasksByStatus[stage.id] || [],
          }));

          setColumns(loadedColumns);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
            linkedMessageThreadId: task.linkedMessageThreadId,
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

  const handleAddStage = async (title: string) => {
    try {
      const response = await fetch('/api/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const result = await response.json();

      if (result.success) {
        const newStage = result.data;
        setColumns((cols) => [
          ...cols,
          {
            id: newStage.id,
            title: newStage.title,
            tasks: [],
          },
        ]);
      }
    } catch (error) {
      console.error('Error adding stage:', error);
    }
  };

  const handleRenameStage = async (stageId: string, newTitle: string) => {
    try {
      const response = await fetch('/api/stages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: stageId, title: newTitle }],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setColumns((cols) =>
          cols.map((col) =>
            col.id === stageId ? { ...col, title: newTitle } : col
          )
        );
      }
    } catch (error) {
      console.error('Error renaming stage:', error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      // Find the first stage (to move tasks to)
      const firstStageId = columns[0]?.id;
      if (!firstStageId) return;

      const response = await fetch(
        `/api/stages?id=${stageId}&moveTasksTo=${firstStageId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (result.success) {
        // Move tasks from deleted stage to first stage
        setColumns((cols) => {
          const stageToDelete = cols.find((col) => col.id === stageId);
          if (!stageToDelete) return cols.filter((col) => col.id !== stageId);

          return cols
            .filter((col) => col.id !== stageId)
            .map((col) =>
              col.id === firstStageId
                ? { ...col, tasks: [...col.tasks, ...stageToDelete.tasks] }
                : col
            );
        });
      }
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
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
              <div className="flex items-center gap-4">
                {isSaving && (
                  <span className="text-xs text-muted-foreground">Saving...</span>
                )}
                <span className="text-sm text-muted-foreground">
                  {columns.reduce((acc, col) => acc + col.tasks.length, 0)} total tasks
                </span>
                <Button variant="outline" onClick={() => setStageModalOpen(true)}>
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
            <KanbanBoard
              columns={columns}
              onColumnsChange={setColumns}
              onTaskLinkClick={handleTaskLinkClick}
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
        stages={columns}
      />

      <StageManagementModal
        open={stageModalOpen}
        onOpenChange={setStageModalOpen}
        stages={columns}
        onAddStage={handleAddStage}
        onRenameStage={handleRenameStage}
        onDeleteStage={handleDeleteStage}
      />
    </>
  );
}
