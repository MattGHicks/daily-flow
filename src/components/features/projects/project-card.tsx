'use client';

import { Project, projectStatusColors } from '@/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
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

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize',
                  projectStatusColors[project.status]
                )}
              >
                {project.status.replace('-', ' ')}
              </span>

              {project.lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(project.lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Source Indicator */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                From <span className="font-medium text-foreground">Monday.com</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
