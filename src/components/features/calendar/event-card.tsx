'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Video, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  status?: string;
  htmlLink?: string;
  colorId?: string;
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
    organizer?: boolean;
  }>;
  conferenceData?: any;
  recurrence?: string[];
}

interface EventCardProps {
  event: CalendarEvent;
  view?: 'compact' | 'full';
  onClick?: () => void;
}

const eventColors: Record<string, string> = {
  '1': 'bg-blue-500/10 border-blue-500/50 text-blue-500',
  '2': 'bg-green-500/10 border-green-500/50 text-green-500',
  '3': 'bg-purple-500/10 border-purple-500/50 text-purple-500',
  '4': 'bg-red-500/10 border-red-500/50 text-red-500',
  '5': 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500',
  '6': 'bg-orange-500/10 border-orange-500/50 text-orange-500',
  '7': 'bg-cyan-500/10 border-cyan-500/50 text-cyan-500',
  '8': 'bg-gray-500/10 border-gray-500/50 text-gray-500',
  '9': 'bg-indigo-500/10 border-indigo-500/50 text-indigo-500',
  '10': 'bg-pink-500/10 border-pink-500/50 text-pink-500',
  '11': 'bg-rose-500/10 border-rose-500/50 text-rose-500',
};

export function EventCard({ event, view = 'compact', onClick }: EventCardProps) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = () => {
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const colorClass = eventColors[event.colorId || '1'] || eventColors['1'];

  const hasVideoConference = event.conferenceData?.entryPoints?.some(
    (ep: any) => ep.entryPointType === 'video'
  );

  if (view === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={onClick}
      >
        <Card className={cn('overflow-hidden border-l-4', colorClass)}>
          <CardHeader className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                  {event.title}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {event.allDay ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      All day
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {hasVideoConference && (
                  <Video className="h-3 w-3 text-muted-foreground" />
                )}
                {event.location && (
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <Users className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('overflow-hidden border-l-4', colorClass)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="flex flex-col gap-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(startDate)}</span>
                  {!event.allDay && (
                    <>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>
                        {formatTime(startDate)} - {formatTime(endDate)} ({getDuration()})
                      </span>
                    </>
                  )}
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}

                {hasVideoConference && (
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Video conference included</span>
                  </div>
                )}
              </div>
            </div>
            {event.htmlLink && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(event.htmlLink, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open in Google Calendar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>

        {(event.description || event.attendees) && (
          <CardContent className="pt-0">
            {event.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {event.description.length > 200
                  ? event.description.substring(0, 200) + '...'
                  : event.description}
              </p>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {event.attendees.slice(0, 5).map((attendee, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                            {attendee.displayName?.[0] || attendee.email?.[0] || '?'}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{attendee.displayName || attendee.email}</p>
                          <p className="text-xs opacity-70">
                            {attendee.responseStatus === 'accepted' && '✓ Accepted'}
                            {attendee.responseStatus === 'declined' && '✗ Declined'}
                            {attendee.responseStatus === 'tentative' && '? Maybe'}
                            {attendee.responseStatus === 'needsAction' && '• No response'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {event.attendees.length > 5 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      +{event.attendees.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}