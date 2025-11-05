'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/features/projects/project-card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { Project } from '@/types/project';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Loader2, RefreshCw, AlertCircle, FolderKanban } from 'lucide-react';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BOARD_NAMES = ['All Boards', 'Revize Projects 2.0', 'Revize Projects', 'QA Board'];

export default function ProjectsPage() {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState('All Boards');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch projects from Monday.com
  const fetchProjects = async (showToast = false) => {
    try {
      setError(null);
      if (!projects.length) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const response = await fetch('/api/monday/projects');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects');
      }

      setProjects(result.data || []);
      setLastUpdated(new Date());

      if (showToast) {
        toast({
          title: 'Projects refreshed',
          description: `Loaded ${result.data?.length || 0} projects from Monday.com`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchProjects();

    const interval = setInterval(() => {
      fetchProjects();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Filter projects by search and board
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBoard =
      boardFilter === 'All Boards' || project.boardName === boardFilter;
    return matchesSearch && matchesBoard;
  });

  // Count projects per board
  const boardCounts = projects.reduce((acc, project) => {
    const boardName = project.boardName || 'Unknown';
    acc[boardName] = (acc[boardName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Overview of your Monday.com projects (read-only)
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col gap-4">
            {/* Search and Refresh */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProjects(true)}
                  disabled={isLoading || isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Board Filter */}
            <div className="flex gap-2 flex-wrap">
              {BOARD_NAMES.map((boardName) => {
                const count =
                  boardName === 'All Boards'
                    ? projects.length
                    : boardCounts[boardName] || 0;
                return (
                  <Button
                    key={boardName}
                    variant={boardFilter === boardName ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBoardFilter(boardName)}
                    disabled={isLoading}
                  >
                    {boardName} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </AnimatedContainer>

        {/* Loading State */}
        {isLoading && (
          <AnimatedContainer animation="fadeIn">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading projects</h3>
              <p className="text-sm text-muted-foreground">
                Fetching your Monday.com projects...
              </p>
            </div>
          </AnimatedContainer>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <AnimatedContainer animation="fadeIn">
            <div className="p-6 rounded-lg border border-destructive/50 bg-destructive/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-destructive mb-1">
                    Failed to load projects
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{error}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchProjects()}
                    >
                      Try Again
                    </Button>
                    {error.includes('API key') && (
                      <Button size="sm" variant="outline" asChild>
                        <a href="/dashboard/settings">Go to Settings</a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <AnimatedContainer
                key={project.id}
                animation="slideUp"
                delay={index * 0.05}
              >
                <ProjectCard project={project} />
              </AnimatedContainer>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProjects.length === 0 && projects.length > 0 && (
          <AnimatedContainer animation="fadeIn">
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          </AnimatedContainer>
        )}

        {/* No Projects at All */}
        {!isLoading && !error && projects.length === 0 && (
          <AnimatedContainer animation="fadeIn">
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Make sure your Monday.com API key is configured and you're assigned to projects.
              </p>
              <Button variant="outline" asChild>
                <a href="/dashboard/settings">Check Settings</a>
              </Button>
            </div>
          </AnimatedContainer>
        )}

        {/* Integration Info */}
        <AnimatedContainer animation="slideUp" delay={0.2}>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">
                  Monday.com Integration
                </h4>
                <p className="text-xs text-muted-foreground">
                  These projects are synced from Monday.com and are read-only. To
                  edit or manage project details, visit your Monday.com workspace.
                  Use the Tasks page to create personal tasks and link them to these
                  projects.
                </p>
              </div>
            </div>
          </div>
        </AnimatedContainer>
    </div>
  );
}
