'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  CalendarRange,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EventCard, CalendarEvent } from './event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type ViewType = 'month' | 'week' | 'day';

interface CalendarViewProps {
  events: CalendarEvent[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAuthenticate?: () => void;
  isAuthenticated?: boolean;
}

export function CalendarView({
  events,
  isLoading = false,
  onRefresh,
  onAuthenticate,
  isAuthenticated = false,
}: CalendarViewProps) {
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get the start of the current view period
  const getViewStart = () => {
    const date = new Date(currentDate);
    if (viewType === 'month') {
      date.setDate(1);
      const dayOfWeek = date.getDay();
      date.setDate(date.getDate() - dayOfWeek);
    } else if (viewType === 'week') {
      const dayOfWeek = date.getDay();
      date.setDate(date.getDate() - dayOfWeek);
    }
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Get the end of the current view period
  const getViewEnd = () => {
    const date = new Date(getViewStart());
    if (viewType === 'month') {
      date.setDate(date.getDate() + 42); // 6 weeks
    } else if (viewType === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setDate(date.getDate() + 1);
    }
    return date;
  };

  // Filter events for the current view
  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const viewStart = getViewStart();
    const viewEnd = getViewEnd();
    return eventStart >= viewStart && eventStart < viewEnd;
  });

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  filteredEvents.forEach(event => {
    const dateKey = new Date(event.start).toDateString();
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  // Navigation functions
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Format header text
  const getHeaderText = () => {
    if (viewType === 'month') {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } else if (viewType === 'week') {
      const start = getViewStart();
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Render day cell for month view
  const renderDayCell = (date: Date) => {
    const dateKey = date.toDateString();
    const dayEvents = eventsByDate[dateKey] || [];
    const isToday = date.toDateString() === new Date().toDateString();
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();

    return (
      <motion.div
        key={dateKey}
        className={cn(
          'min-h-[100px] p-2 border-r border-b',
          !isCurrentMonth && 'bg-muted/30',
          isToday && 'bg-primary/5'
        )}
        whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={cn(
              'text-sm font-medium',
              !isCurrentMonth && 'text-muted-foreground',
              isToday && 'text-primary'
            )}
          >
            {date.getDate()}
          </span>
          {dayEvents.length > 0 && (
            <Badge variant="secondary" className="text-xs px-1">
              {dayEvents.length}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'text-xs p-1 rounded truncate cursor-pointer',
                'bg-primary/10 hover:bg-primary/20 transition-colors'
              )}
              onClick={() => setSelectedEvent(event)}
            >
              {event.allDay ? '◉' : new Date(event.start).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}{' '}
              {event.title}
            </motion.div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const weeks = [];
    const startDate = getViewStart();

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        days.push(renderDayCell(date));
      }
      weeks.push(
        <div key={week} className="grid grid-cols-7">
          {days}
        </div>
      );
    }

    return (
      <div className="bg-background rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks}
      </div>
    );
  };

  // Render week/day view
  const renderTimelineView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = viewType === 'week' ? 7 : 1;
    const startDate = getViewStart();

    return (
      <div className="bg-background rounded-lg overflow-hidden">
        {viewType === 'week' && (
          <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
            <div className="p-2 border-r" />
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date(startDate);
              date.setDate(startDate.getDate() + i);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={cn(
                    'p-2 text-center border-r',
                    isToday && 'bg-primary/5'
                  )}
                >
                  <div className="text-sm font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={cn(
                    'text-lg',
                    isToday && 'text-primary font-bold'
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="overflow-y-auto max-h-[600px]">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b">
              <div className="p-2 text-xs text-muted-foreground border-r">
                {hour === 0
                  ? '12 AM'
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? '12 PM'
                  : `${hour - 12} PM`}
              </div>
              {Array.from({ length: days }, (_, dayIndex) => {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + dayIndex);
                cellDate.setHours(hour, 0, 0, 0);
                const cellDateEnd = new Date(cellDate);
                cellDateEnd.setHours(hour + 1);

                const cellEvents = filteredEvents.filter(event => {
                  const eventStart = new Date(event.start);
                  return (
                    eventStart >= cellDate &&
                    eventStart < cellDateEnd &&
                    !event.allDay
                  );
                });

                return (
                  <div
                    key={dayIndex}
                    className="min-h-[50px] p-1 border-r hover:bg-muted/30"
                  >
                    {cellEvents.map(event => (
                      <motion.div
                        key={event.id}
                        className="text-xs p-1 bg-primary/10 rounded mb-1 cursor-pointer hover:bg-primary/20"
                        onClick={() => setSelectedEvent(event)}
                        whileHover={{ scale: 1.05 }}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Google Calendar</h3>
        <p className="text-muted-foreground mb-4">
          Sign in with your Google account to view your calendar events (read-only access)
        </p>
        <Button onClick={onAuthenticate}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Connect Google Calendar (Read-only)
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={navigatePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={navigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={navigateToday}
          >
            Today
          </Button>
          <h2 className="text-xl font-semibold ml-4">{getHeaderText()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
            <TabsList>
              <TabsTrigger value="month">
                <CalendarDays className="h-4 w-4 mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="week">
                <CalendarRange className="h-4 w-4 mr-2" />
                Week
              </TabsTrigger>
              <TabsTrigger value="day">
                <CalendarClock className="h-4 w-4 mr-2" />
                Day
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Calendar content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewType}-${currentDate.toISOString()}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewType === 'month' ? renderMonthView() : renderTimelineView()}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Selected event modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              <EventCard event={selectedEvent} view="full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}