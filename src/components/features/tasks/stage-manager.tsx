'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  AlertCircle,
  Settings2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StageModal } from './stage-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskStage {
  id: string;
  key: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  isDefault: boolean;
  canDelete: boolean;
}

interface StageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: TaskStage[];
  onRefresh: () => Promise<void>;
}

export function StageManager({ open, onOpenChange, stages, onRefresh }: StageManagerProps) {
  const [reorderedStages, setReorderedStages] = useState<TaskStage[]>(stages);
  const [editingStage, setEditingStage] = useState<TaskStage | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmStage, setDeleteConfirmStage] = useState<TaskStage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setReorderedStages(stages);
  }, [stages]);

  const handleReorder = async (newOrder: TaskStage[]) => {
    setReorderedStages(newOrder);

    // Save reordered stages to backend
    setIsSaving(true);
    try {
      const response = await fetch('/api/task-stages/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder stages');
      }

      await onRefresh();
    } catch (error) {
      console.error('Error reordering stages:', error);
      // Revert on error
      setReorderedStages(stages);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateStage = async (stageData: Partial<TaskStage>) => {
    try {
      const response = await fetch('/api/task-stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData),
      });

      if (!response.ok) {
        throw new Error('Failed to create stage');
      }

      await onRefresh();
      setCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  const handleUpdateStage = async (stageData: Partial<TaskStage>) => {
    try {
      const response = await fetch('/api/task-stages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData),
      });

      if (!response.ok) {
        throw new Error('Failed to update stage');
      }

      await onRefresh();
      setEditingStage(null);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleDeleteStage = async (stage: TaskStage) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/task-stages?id=${stage.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete stage');
      }

      await onRefresh();
    } catch (error: any) {
      console.error('Error deleting stage:', error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmStage(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Manage Task Stages
            </DialogTitle>
            <DialogDescription>
              Customize your workflow by adding, editing, or reordering task stages.
              Drag stages to reorder them.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <Reorder.Group
              axis="y"
              values={reorderedStages}
              onReorder={handleReorder}
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {reorderedStages.map((stage) => (
                  <Reorder.Item
                    key={stage.id}
                    value={stage}
                    id={stage.id}
                    className="group"
                    disabled={isSaving}
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border bg-card',
                        'transition-all duration-200',
                        isSaving && 'opacity-50'
                      )}
                      style={{
                        borderColor: `${stage.color}40`,
                        backgroundColor: `${stage.color}08`
                      }}
                    >
                      {/* Drag handle */}
                      <div className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {/* Stage info */}
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-2xl">{stage.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{stage.name}</span>
                            {stage.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Default
                              </span>
                            )}
                            {!stage.canDelete && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Key: {stage.key}
                          </span>
                        </div>
                      </div>

                      {/* Color indicator */}
                      <div
                        className="h-6 w-6 rounded-full border-2"
                        style={{
                          backgroundColor: stage.color,
                          borderColor: stage.color
                        }}
                      />

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingStage(stage)}
                          disabled={isSaving}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {stage.canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => setDeleteConfirmStage(stage)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Stages with tasks cannot be deleted
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
              <Button
                onClick={() => setCreateModalOpen(true)}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Stage Modal */}
      <StageModal
        open={createModalOpen || !!editingStage}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false);
            setEditingStage(null);
          }
        }}
        stage={editingStage}
        onSave={editingStage ? handleUpdateStage : handleCreateStage}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmStage}
        onOpenChange={(open) => !open && setDeleteConfirmStage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{deleteConfirmStage?.name}" stage?
              This action cannot be undone. Make sure there are no tasks in this stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmStage && handleDeleteStage(deleteConfirmStage)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Stage'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}