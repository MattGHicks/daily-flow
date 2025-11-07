'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/kanban';
import { Calendar, Clock, Link2, MessageSquare, User, AlertCircle, Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onLinkClick?: () => void;
  onEditClick?: (task: Task) => void;
  onDeleteClick?: (task: Task) => void;
  isOverlay?: boolean;
}

export function TaskCardImproved({ task, onLinkClick, onEditClick, onDeleteClick, isOverlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task.id });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  // Priority colors with improved visibility
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent';
      case 'low':
        return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-500/5 to-transparent';
      default:
        return 'border-l-4 border-l-muted-foreground';
    }
  };

  // Priority badge colors
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      default:
        return '';
    }
  };

  // Calculate days until due
  const getDaysUntilDue = () => {
    if (!task.dueDate) return null;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative cursor-move",
        isDragging && "opacity-50 cursor-grabbing",
        isOver && "ring-2 ring-primary ring-offset-2 rounded-lg"
      )}
    >
      <div>
        <Card
          className={cn(
            "select-none transition-all duration-200",
            "hover:shadow-lg",
            getPriorityColor(task.priority || 'low'),
            isDragging && "shadow-2xl cursor-grabbing",
            isOverlay && "shadow-2xl border-primary/50"
          )}
        >
          <CardHeader className="pb-2 pr-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2 pr-2">
                  {task.title}
                </h3>
              </div>

              {/* Action buttons */}
              <AnimatePresence>
                {isHovered && !isDragging && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick?.(task);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLinkClick?.();
                      }}
                    >
                      <Link2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/10 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick?.(task);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Priority and Due Date badges */}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs transition-colors",
                  getPriorityBadgeColor(task.priority || 'low')
                )}
              >
                {task.priority}
              </Badge>

              {daysUntilDue !== null && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    daysUntilDue < 0 && "bg-red-500/10 text-red-500",
                    daysUntilDue === 0 && "bg-orange-500/10 text-orange-500",
                    daysUntilDue > 0 && daysUntilDue <= 3 && "bg-yellow-500/10 text-yellow-500"
                  )}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {daysUntilDue < 0
                    ? `${Math.abs(daysUntilDue)}d overdue`
                    : daysUntilDue === 0
                    ? "Due today"
                    : `${daysUntilDue}d`}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-2 pb-3 space-y-3">
            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Links section */}
            {(task.linkedProjectId || task.linkedMessageThreadId) && (
              <div className="flex flex-col gap-2">
                {task.linkedProjectId && (
                  <a
                    href={task.linkedProjectUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 truncate flex-1">
                      {task.linkedProjectName || 'Monday.com Project'}
                    </span>
                    <ExternalLink className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                )}

                {task.linkedMessageThreadId && (
                  <a
                    href={task.linkedMessageThreadUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare className="h-3 w-3 text-purple-500 flex-shrink-0" />
                    <span className="text-xs text-purple-600 dark:text-purple-400 truncate flex-1">
                      {task.linkedMessageThreadName || 'Redmine Thread'}
                    </span>
                    <ExternalLink className="h-3 w-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                )}
              </div>
            )}

            {/* Metadata row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {task.assignee && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{task.assignee}</span>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs px-1.5 py-0 h-5 hover:bg-primary/10 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}