'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';
import { Save, Palette, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStage {
  id?: string;
  key?: string;
  name: string;
  color: string;
  icon: string;
  order?: number;
  isDefault?: boolean;
  canDelete?: boolean;
}

interface StageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage?: TaskStage | null;
  onSave: (stage: Partial<TaskStage>) => Promise<void>;
}

const colorPresets = [
  '#64748b', // Slate
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#22c55e', // Green
  '#ef4444', // Red
  '#f97316', // Orange
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#8b5cf6', // Violet
];

const iconPresets = [
  '📋', '📝', '🚀', '👀', '✅',
  '🎯', '💡', '🔥', '⚡', '🌟',
  '🎨', '🔧', '🔍', '📊', '📈',
  '🏆', '🎪', '🎭', '🎬', '🎤',
];

export function StageModal({ open, onOpenChange, stage, onSave }: StageModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6b7280');
  const [icon, setIcon] = useState('📌');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stage) {
      setName(stage.name || '');
      setColor(stage.color || '#6b7280');
      setIcon(stage.icon || '📌');
    } else {
      setName('');
      setColor('#6b7280');
      setIcon('📌');
    }
    setErrors({});
  }, [stage, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Stage name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        ...(stage?.id && { id: stage.id }),
        name: name.trim(),
        color,
        icon,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            {stage?.id ? 'Edit Stage' : 'Create New Stage'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Stage Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Stage Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., In Review, Testing, Blocked"
              className={cn(errors.name && 'border-red-500')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: color }}
                  >
                    <div
                      className="mr-2 h-4 w-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((presetColor) => (
                      <motion.button
                        key={presetColor}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'h-8 w-8 rounded-md border-2 transition-all',
                          color === presetColor ? 'border-gray-900 dark:border-gray-100' : 'border-transparent'
                        )}
                        style={{ backgroundColor: presetColor }}
                        onClick={() => setColor(presetColor)}
                        aria-label={`Select ${presetColor}`}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      className="font-mono text-xs"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Icon Selection */}
          <div className="grid gap-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-lg"
                  >
                    {icon}
                    <span className="ml-2 text-sm font-normal">Select icon</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-5 gap-2">
                    {iconPresets.map((presetIcon) => (
                      <motion.button
                        key={presetIcon}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'h-8 w-8 flex items-center justify-center text-xl rounded-md border-2 transition-all',
                          icon === presetIcon
                            ? 'border-gray-900 dark:border-gray-100 bg-muted'
                            : 'border-transparent hover:bg-muted'
                        )}
                        onClick={() => setIcon(presetIcon)}
                        aria-label={`Select ${presetIcon}`}
                      >
                        {presetIcon}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="Enter emoji"
                      className="text-center text-lg"
                      maxLength={2}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border p-4 bg-muted/30">
          <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
          <div
            className="p-3 rounded-lg border-2 flex items-center gap-2"
            style={{
              borderColor: color,
              backgroundColor: `${color}15`
            }}
          >
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold">{name || 'Stage Name'}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : stage?.id ? 'Update Stage' : 'Create Stage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}