'use client';

import { TaskCardImproved } from './task-card-improved';
import { Task } from '@/types/kanban';

interface SortableTaskCardProps {
  task: Task;
  onLinkClick?: () => void;
  onEditClick?: (task: Task) => void;
  onDeleteClick?: (task: Task) => void;
}

export function SortableTaskCardImproved({ task, onLinkClick, onEditClick, onDeleteClick }: SortableTaskCardProps) {
  return <TaskCardImproved task={task} onLinkClick={onLinkClick} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />;
}