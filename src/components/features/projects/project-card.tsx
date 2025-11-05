'use client';

import { Project } from '@/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Folder } from 'lucide-react';
import { getMondayColorClasses } from '@/lib/monday-colors';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Get color classes from Monday.com status color
  const statusColorClasses = getMondayColorClasses(project.mondayStatusColor || null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Project Title */}
            <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>

            {/* Status and Date */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                  statusColorClasses
                )}
              >
                {project.status || 'No Status'}
              </span>

              {project.lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(project.lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Board and Group Info */}
            <div className="pt-2 border-t border-border space-y-1">
              {project.boardName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Folder className="h-3 w-3" />
                  <span className="font-medium text-foreground">{project.boardName}</span>
                  {project.groupName && (
                    <>
                      <span>·</span>
                      <span>{project.groupName}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
