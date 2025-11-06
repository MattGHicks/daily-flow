'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from '@/types/kanban';
import { SortableTaskCardImproved } from './sortable-task-card-improved';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import { Task } from '@/types/kanban';

interface KanbanColumnProps {
  column: Column;
  onTaskLinkClick?: (taskId: string) => void;
  onTaskEditClick?: (task: Task) => void;
  onAddTask?: () => void;
  onEditColumn?: () => void;
}

export function KanbanColumnImproved({ column, onTaskLinkClick, onTaskEditClick, onAddTask, onEditColumn }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Use color from column or fallback to default
  const getColumnColor = () => {
    if (column.color) {
      // Dynamic color - convert hex to CSS classes dynamically
      return '';
    }
    // Fallback to default colors
    switch (column.id) {
      case 'backlog':
        return 'from-slate-500/10 to-slate-500/5 border-slate-500/20';
      case 'todo':
        return 'from-blue-500/10 to-blue-500/5 border-blue-500/20';
      case 'in-progress':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20';
      case 'review':
        return 'from-purple-500/10 to-purple-500/5 border-purple-500/20';
      case 'done':
        return 'from-green-500/10 to-green-500/5 border-green-500/20';
      default:
        return 'from-muted/50 to-muted/20 border-border';
    }
  };

  // Use icon from column or fallback to default
  const getColumnIcon = () => {
    if (column.icon) return column.icon;

    switch (column.id) {
      case 'backlog':
        return '📋';
      case 'todo':
        return '📝';
      case 'in-progress':
        return '🚀';
      case 'review':
        return '👀';
      case 'done':
        return '✅';
      default:
        return '📌';
    }
  };

  return (
    <motion.div
      className="flex flex-col w-80 shrink-0"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Column header */}
      <motion.div
        className="flex items-center justify-between mb-3 px-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getColumnIcon()}</span>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {column.title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {column.tasks.length}
              </span>
            </h3>
          </div>
        </div>
      </motion.div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 rounded-xl transition-all duration-300",
          "bg-gradient-to-b border",
          !column.color && getColumnColor(),
          "min-h-[400px] max-h-[calc(100vh-300px)]",
          "overflow-y-auto overflow-x-hidden",
          "scrollbar-thin",
          isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]"
        )}
        style={column.color ? {
          borderColor: `${column.color}40`,
          backgroundColor: `${column.color}08`,
        } : undefined}
      >
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {column.tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No tasks yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddTask}
                    className="hover:bg-primary/10"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Task
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div className="space-y-3">
                {column.tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                    }}
                  >
                    <SortableTaskCardImproved
                      task={task}
                      onLinkClick={onTaskLinkClick ? () => onTaskLinkClick(task.id) : undefined}
                      onEditClick={onTaskEditClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </SortableContext>

        {/* Drop zone indicator */}
        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 80 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 flex items-center justify-center"
            >
              <p className="text-sm text-primary font-medium">Drop task here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Column summary */}
      {column.tasks.length > 0 && (
        <motion.div
          className="mt-2 px-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {column.tasks.filter(t => t.priority === 'high').length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {column.tasks.filter(t => t.priority === 'high').length} high priority
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}