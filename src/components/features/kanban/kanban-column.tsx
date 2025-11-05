'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from '@/types/kanban';
import { SortableTaskCard } from './sortable-task-card';

interface KanbanColumnProps {
  column: Column;
  onTaskLinkClick?: (taskId: string) => void;
}

export function KanbanColumn({ column, onTaskLinkClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {column.tasks.length} {column.tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[200px] p-2 rounded-lg bg-muted/20 overflow-y-auto"
      >
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onLinkClick={onTaskLinkClick ? () => onTaskLinkClick(task.id) : undefined}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
