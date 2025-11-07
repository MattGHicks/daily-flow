'use client';

import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Column, Task } from '@/types/kanban';
import { KanbanColumnImproved } from './kanban-column-improved';
import { TaskCardImproved } from './task-card-improved';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onTaskLinkClick?: (taskId: string) => void;
  onTaskEditClick?: (task: Task) => void;
  onTaskDeleteClick?: (task: Task) => void;
  onAddTaskFromColumn?: (columnId: string) => void;
}

export function KanbanBoardImproved({ columns, onColumnsChange, onTaskLinkClick, onTaskEditClick, onTaskDeleteClick, onAddTaskFromColumn }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  // Check scroll position to show/hide navigation arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  // Smooth scroll navigation
  const scrollToColumn = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 350; // Width of one column + gap
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll = direction === 'left'
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && e.shiftKey) {
        scrollToColumn('left');
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        scrollToColumn('right');
      } else if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);
    setActiveTask(task || null);
    setIsDragging(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      const activeTask = activeColumn.tasks.find((task) => task.id === activeId);
      if (!activeTask) return;

      const newColumns = columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const overTaskIndex = col.tasks.findIndex((task) => task.id === overId);
          const newTasks = [...col.tasks];
          if (overTaskIndex === -1) {
            newTasks.push(activeTask);
          } else {
            newTasks.splice(overTaskIndex, 0, activeTask);
          }
          return { ...col, tasks: newTasks };
        }
        return col;
      });

      onColumnsChange(newColumns);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setIsDragging(false);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tasks.findIndex((task) => task.id === activeId);
      const newIndex = activeColumn.tasks.findIndex((task) => task.id === overId);

      const newColumns = columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: arrayMove(col.tasks, oldIndex, newIndex),
          };
        }
        return col;
      });

      onColumnsChange(newColumns);
    }
  };

  return (
    <div className={cn(
      "relative transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50 bg-background p-6"
    )}>
      {/* Fullscreen toggle */}
      <motion.div
        className="absolute top-0 right-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="hover:bg-primary/10"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Navigation buttons */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollToColumn('left')}
              className="rounded-full shadow-lg bg-background/95 backdrop-blur-sm hover:bg-primary/10 border-primary/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollToColumn('right')}
              className="rounded-full shadow-lg bg-background/95 backdrop-blur-sm hover:bg-primary/10 border-primary/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Columns container with smooth scrolling */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-6 pb-4 transition-all duration-300",
            "overflow-x-auto overflow-y-hidden",
            "scroll-smooth snap-x snap-proximity",
            // Hide native scrollbar
            "scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]",
            "[&::-webkit-scrollbar]:hidden",
            // Add padding for navigation buttons
            "px-12",
            isDragging && "cursor-grabbing"
          )}
          style={{
            maskImage: canScrollLeft || canScrollRight
              ? 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)'
              : undefined,
            WebkitMaskImage: canScrollLeft || canScrollRight
              ? 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)'
              : undefined,
          }}
        >
          {columns.map((column, index) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="snap-center"
            >
              <KanbanColumnImproved
                column={column}
                onTaskLinkClick={onTaskLinkClick}
                onTaskEditClick={onTaskEditClick}
                onTaskDeleteClick={onTaskDeleteClick}
                onAddTask={onAddTaskFromColumn ? () => onAddTaskFromColumn(column.id) : undefined}
              />
            </motion.div>
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="cursor-grabbing opacity-90">
              <TaskCardImproved task={activeTask} isOverlay={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Scroll indicator dots */}
      <motion.div
        className="flex justify-center gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {columns.map((column, index) => (
          <button
            key={column.id}
            onClick={() => {
              const columnWidth = 350;
              scrollContainerRef.current?.scrollTo({
                left: index * columnWidth,
                behavior: 'smooth'
              });
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              "hover:scale-125",
              index === Math.round((scrollContainerRef.current?.scrollLeft || 0) / 350)
                ? "bg-primary w-6"
                : "bg-muted-foreground/30"
            )}
            aria-label={`Scroll to ${column.title}`}
          />
        ))}
      </motion.div>

      {/* Keyboard shortcuts hint */}
      <motion.div
        className="absolute bottom-4 left-4 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
      >
        <span className="hidden lg:block">
          Shift + Arrow keys to navigate • Ctrl + F for fullscreen
        </span>
      </motion.div>
    </div>
  );
}