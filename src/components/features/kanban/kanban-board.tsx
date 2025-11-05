'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Column, Task } from '@/types/kanban';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onTaskLinkClick?: (taskId: string) => void;
}

export function KanbanBoard({ columns, onColumnsChange, onTaskLinkClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      const activeTask = activeColumn.tasks.find((task) => task.id === activeId);
      if (!activeTask) return;

      const newColumns = columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const overTaskIndex = col.tasks.findIndex((task) => task.id === overId);
          const newTasks = [...col.tasks];
          if (overTaskIndex === -1) {
            newTasks.push(activeTask);
          } else {
            newTasks.splice(overTaskIndex, 0, activeTask);
          }
          return { ...col, tasks: newTasks };
        }
        return col;
      });

      onColumnsChange(newColumns);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tasks.findIndex((task) => task.id === activeId);
      const newIndex = activeColumn.tasks.findIndex((task) => task.id === overId);

      const newColumns = columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: arrayMove(col.tasks, oldIndex, newIndex),
          };
        }
        return col;
      });

      onColumnsChange(newColumns);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} onTaskLinkClick={onTaskLinkClick} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
