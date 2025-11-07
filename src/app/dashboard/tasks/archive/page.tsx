'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedContainer } from '@/components/shared/animated-container';
import {
  Archive,
  ArrowLeft,
  ArchiveRestore,
  Trash2,
  Search,
  Calendar,
  Clock,
  User,
  Link2,
  MessageSquare,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Task } from '@/types/kanban';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SortOption = 'date' | 'priority' | 'title';
type SortDirection = 'asc' | 'desc';

export default function ArchivePage() {
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks/archived');
      const result = await response.json();

      if (result.success) {
        setArchivedTasks(result.data);
      }
    } catch (error) {
      console.error('Error fetching archived tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async (task: Task) => {
    try {
      const response = await fetch('/api/tasks/archived', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove from archived list
        setArchivedTasks((tasks) => tasks.filter((t) => t.id !== task.id));
      }
    } catch (error) {
      console.error('Error unarchiving task:', error);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setArchivedTasks((tasks) => tasks.filter((t) => t.id !== task.id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const getPriorityValue = (priority: string) => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const sortedAndFilteredTasks = archivedTasks
    .filter((task) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
          const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'priority':
          comparison = getPriorityValue(a.priority || 'low') - getPriorityValue(b.priority || 'low');
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getPriorityColor = (priority: string) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <AnimatedContainer animation="slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Archive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Archived Tasks</h2>
              <p className="text-sm text-muted-foreground">
                View and manage your archived tasks
              </p>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* Search and Sort */}
      <AnimatedContainer animation="slideUp" delay={0.1}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search archived tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Button
                  variant={sortBy === 'date' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('date')}
                  className="gap-1"
                >
                  Date
                  {sortBy === 'date' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant={sortBy === 'priority' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('priority')}
                  className="gap-1"
                >
                  Priority
                  {sortBy === 'priority' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant={sortBy === 'title' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort('title')}
                  className="gap-1"
                >
                  Title
                  {sortBy === 'title' && (
                    sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Task List */}
      <AnimatedContainer animation="slideUp" delay={0.2}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading archived tasks...</p>
          </div>
        ) : sortedAndFilteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No archived tasks</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No tasks match your search criteria'
                    : 'Tasks moved to "Done" will be automatically archived after 3 days'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedAndFilteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', getPriorityColor(task.priority || 'low'))}
                          >
                            {task.priority}
                          </Badge>

                          {task.archivedAt && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Archived {new Date(task.archivedAt).toLocaleDateString()}
                            </Badge>
                          )}

                          {task.assignee && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {task.assignee}
                            </Badge>
                          )}

                          {task.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          )}

                          {task.tags && task.tags.length > 0 && (
                            <>
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </>
                          )}
                        </div>

                        {(task.linkedProjectId || task.linkedMessageThreadId) && (
                          <div className="flex flex-col gap-2 mt-3">
                            {task.linkedProjectId && (
                              <a
                                href={task.linkedProjectUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <Link2 className="h-3 w-3" />
                                {task.linkedProjectName || 'Monday.com Project'}
                              </a>
                            )}
                            {task.linkedMessageThreadId && (
                              <a
                                href={task.linkedMessageThreadUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                              >
                                <MessageSquare className="h-3 w-3" />
                                {task.linkedMessageThreadName || 'Redmine Thread'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchive(task)}
                          className="gap-2"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(task)}
                          className="gap-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatedContainer>

      {/* Summary */}
      {!isLoading && sortedAndFilteredTasks.length > 0 && (
        <AnimatedContainer animation="fadeIn" delay={0.3}>
          <div className="text-center text-sm text-muted-foreground">
            Showing {sortedAndFilteredTasks.length} of {archivedTasks.length} archived tasks
          </div>
        </AnimatedContainer>
      )}
    </div>
  );
}
