'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/kanban';
import { Project } from '@/types/project';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, AlertCircle, Tag, MessageSquare, Link, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockMessageThreads } from '@/lib/data/mock-messages';
import { Button } from '@/components/ui/button';
import { MondayIcon } from '@/components/icons/monday-icon';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onLinkClick?: () => void;
}

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-primary/10 text-primary border-primary/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function TaskCard({ task, isDragging = false, onLinkClick }: TaskCardProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/monday/projects');
        const result = await response.json();
        if (result.success) {
          setProjects(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const linkedProject = projects.find((p) => p.id === task.linkedProjectId);
  const linkedThread = mockMessageThreads.find((t) => t.id === task.linkedMessageThreadId);

  return (
    <Card
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'opacity-50'
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-snug flex-1">{task.title}</h4>
          <div className="flex items-center gap-1 shrink-0">
            {task.priority === 'high' && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {onLinkClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onLinkClick();
                }}
              >
                <Link className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {task.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {/* Linked Items */}
        {(linkedProject || linkedThread) && (
          <div className="space-y-1.5 pb-2 border-b border-border">
            {linkedProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (linkedProject.mondayUrl) {
                    window.open(linkedProject.mondayUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="w-full flex items-center gap-2 text-left p-1.5 rounded hover:bg-muted transition-colors group"
              >
                <MondayIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground flex-1 truncate group-hover:text-foreground">
                  {linkedProject.title}
                </span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground shrink-0" />
              </button>
            )}
            {linkedThread && (
              <button className="w-full flex items-center gap-2 text-left p-1.5 rounded hover:bg-muted transition-colors group">
                <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground flex-1 truncate group-hover:text-foreground">
                  {linkedThread.client}
                </span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground shrink-0" />
              </button>
            )}
          </div>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-medium border',
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2 mt-2">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground">{task.assignee}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
