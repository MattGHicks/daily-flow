'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/shared/dashboard-header';
import { ProjectCard } from '@/components/features/projects/project-card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { mockProjects } from '@/lib/data/mock-projects';
import { Project, ProjectStatus } from '@/types/project';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = mockProjects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<ProjectStatus, number>);

  return (
    <>
      <DashboardHeader
        title="Projects"
        subtitle="Overview of your Monday.com projects (read-only)"
      />

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({mockProjects.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active ({statusCounts.active || 0})
              </Button>
              <Button
                variant={statusFilter === 'planning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('planning')}
              >
                Planning ({statusCounts.planning || 0})
              </Button>
              <Button
                variant={statusFilter === 'on-hold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('on-hold')}
              >
                On Hold ({statusCounts['on-hold'] || 0})
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
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
        ) : (
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
    </>
  );
}
