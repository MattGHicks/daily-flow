'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { PlusCircle, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Column } from '@/types/kanban';

interface StageManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Column[];
  onAddStage: (title: string) => void;
  onRenameStage: (stageId: string, newTitle: string) => void;
  onDeleteStage: (stageId: string) => void;
}

export function StageManagementModal({
  open,
  onOpenChange,
  stages,
  onAddStage,
  onRenameStage,
  onDeleteStage,
}: StageManagementModalProps) {
  const [newStageTitle, setNewStageTitle] = useState('');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageTitle, setEditingStageTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);

  const handleAddStage = () => {
    if (!newStageTitle.trim()) return;
    onAddStage(newStageTitle.trim());
    setNewStageTitle('');
  };

  const handleStartEdit = (stageId: string, currentTitle: string) => {
    setEditingStageId(stageId);
    setEditingStageTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (!editingStageId || !editingStageTitle.trim()) return;
    onRenameStage(editingStageId, editingStageTitle.trim());
    setEditingStageId(null);
    setEditingStageTitle('');
  };

  const handleCancelEdit = () => {
    setEditingStageId(null);
    setEditingStageTitle('');
  };

  const handleDeleteClick = (stageId: string) => {
    setStageToDelete(stageId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (stageToDelete) {
      onDeleteStage(stageToDelete);
      setStageToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Stages</DialogTitle>
            <DialogDescription>
              Add, rename, or delete stages for your task board.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Add New Stage */}
            <div className="space-y-2">
              <Label>Add New Stage</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter stage name"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddStage();
                    }
                  }}
                />
                <Button onClick={handleAddStage} disabled={!newStageTitle.trim()}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Existing Stages */}
            <div className="space-y-2">
              <Label>Existing Stages</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {editingStageId === stage.id ? (
                      <>
                        <Input
                          value={editingStageTitle}
                          onChange={(e) => setEditingStageTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editingStageTitle.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{stage.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {stage.tasks.length} {stage.tasks.length === 1 ? 'task' : 'tasks'}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(stage.id, stage.title)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(stage.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stage? All tasks in this stage will be
              moved to the first stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
