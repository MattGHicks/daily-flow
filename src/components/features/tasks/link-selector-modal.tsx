'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { MessageThread } from '@/types/message';
import { Search, FolderKanban, MessageSquare, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMondayColorClasses } from '@/lib/monday-colors';

interface LinkSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId?: string;
  currentThreadId?: string;
  onLinkProject: (projectId: string) => void;
  onLinkThread: (threadId: string) => void;
  onUnlinkProject: () => void;
  onUnlinkThread: () => void;
}

export function LinkSelectorModal({
  open,
  onOpenChange,
  currentProjectId,
  currentThreadId,
  onLinkProject,
  onLinkThread,
  onUnlinkProject,
  onUnlinkThread,
}: LinkSelectorModalProps) {
  const [projectSearch, setProjectSearch] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  // Fetch Monday.com projects and Redmine issues when modal opens
  useEffect(() => {
    if (open) {
      fetchProjects();
      fetchMessageThreads();
    }
  }, [open]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/monday/projects');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchMessageThreads = async () => {
    setIsLoadingThreads(true);
    setThreadsError(null);
    try {
      const response = await fetch('/api/redmine/issues');
      const result = await response.json();
      if (result.success) {
        setMessageThreads(result.data || []);
      } else {
        setThreadsError(result.error || 'Failed to fetch message threads');
        if (result.needsConfiguration) {
          setThreadsError('Redmine not configured. Please add your Redmine URL and API key in Settings.');
        }
      }
    } catch (error) {
      console.error('Error fetching message threads:', error);
      setThreadsError('Failed to connect to Redmine. Please check your settings.');
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredThreads = messageThreads.filter((thread) =>
    (thread.client + ' ' + thread.subject)
      .toLowerCase()
      .includes(threadSearch.toLowerCase())
  );

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const currentThread = messageThreads.find((t) => t.id === currentThreadId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Link to Task</DialogTitle>
          <DialogDescription>
            Connect this task to a Monday.com project or Redmine message thread for
            easy access.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="projects" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="threads" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message Threads
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent
            value="projects"
            className="flex-1 overflow-hidden flex flex-col space-y-4 mt-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Currently Linked */}
            {currentProject && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Currently linked
                    </p>
                    <p className="font-medium text-sm">{currentProject.title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUnlinkProject}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoadingProjects && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Project List */}
            {!isLoadingProjects && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {filteredProjects.map((project) => {
                  const isLinked = project.id === currentProjectId;
                  return (
                    <button
                      key={project.id}
                      onClick={() => {
                        if (!isLinked) {
                          onLinkProject(project.id);
                          onOpenChange(false);
                        }
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        isLinked
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:bg-muted'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{project.title}</p>
                          <span
                            className={cn(
                              'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                              getMondayColorClasses(project.mondayStatusColor || null)
                            )}
                          >
                            {project.status}
                          </span>
                        </div>
                        {isLinked && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No projects found
                  </div>
                )}
              </div>
            )}

          </TabsContent>

          {/* Message Threads Tab */}
          <TabsContent
            value="threads"
            className="flex-1 overflow-hidden flex flex-col space-y-4 mt-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search message threads..."
                value={threadSearch}
                onChange={(e) => setThreadSearch(e.target.value)}
                className="pl-9"
                disabled={isLoadingThreads || !!threadsError}
              />
            </div>

            {/* Currently Linked */}
            {currentThread && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Currently linked
                    </p>
                    <p className="font-medium text-sm">{currentThread.client}</p>
                    <p className="text-xs text-muted-foreground">{currentThread.subject}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUnlinkThread}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoadingThreads && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error State */}
            {threadsError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="font-medium text-sm">Unable to load message threads</p>
                </div>
                <p className="text-xs text-muted-foreground">{threadsError}</p>
              </div>
            )}

            {/* Thread List */}
            {!isLoadingThreads && !threadsError && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {filteredThreads.map((thread) => {
                  const isLinked = thread.id === currentThreadId;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => {
                        if (!isLinked) {
                          onLinkThread(thread.id);
                          onOpenChange(false);
                        }
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        isLinked
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:bg-muted'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{thread.client}</p>
                            {thread.unread && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {thread.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {thread.timestamp}
                          </p>
                        </div>
                        {isLinked && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
                {filteredThreads.length === 0 && messageThreads.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No message threads available
                  </div>
                )}
                {filteredThreads.length === 0 && messageThreads.length > 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No message threads found matching your search
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
