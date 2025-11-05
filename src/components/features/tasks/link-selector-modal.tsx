'use client';

import { useState } from 'react';
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
import { mockProjects } from '@/lib/data/mock-projects';
import { mockMessageThreads } from '@/lib/data/mock-messages';
import { Project, projectStatusColors } from '@/types/project';
import { MessageThread } from '@/types/message';
import { Search, FolderKanban, MessageSquare, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const filteredProjects = mockProjects.filter((project) =>
    project.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredThreads = mockMessageThreads.filter((thread) =>
    (thread.client + ' ' + thread.subject)
      .toLowerCase()
      .includes(threadSearch.toLowerCase())
  );

  const currentProject = mockProjects.find((p) => p.id === currentProjectId);
  const currentThread = mockMessageThreads.find((t) => t.id === currentThreadId);

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

            {/* Project List */}
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
                            'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
                            projectStatusColors[project.status]
                          )}
                        >
                          {project.status.replace('-', ' ')}
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

            {/* Thread List */}
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
                      </div>
                      {isLinked && (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredThreads.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No message threads found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
