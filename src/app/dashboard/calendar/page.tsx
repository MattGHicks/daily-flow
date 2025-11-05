'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { Calendar as CalendarIcon, Clock, Video, MapPin } from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: 'Client Call - Acme Inc.',
    time: 'Today, 2:00 PM - 3:00 PM',
    type: 'meeting',
    location: 'Google Meet',
    color: 'primary',
  },
  {
    id: 2,
    title: 'Project Deadline: Website Redesign',
    time: 'Tomorrow, 5:00 PM',
    type: 'deadline',
    location: 'WebCorp Project',
    color: 'destructive',
  },
  {
    id: 3,
    title: 'Weekly Planning Session',
    time: 'Friday, 10:00 AM - 11:00 AM',
    type: 'meeting',
    location: 'Zoom',
    color: 'primary',
  },
  {
    id: 4,
    title: 'Design Review',
    time: 'Monday, 3:00 PM - 4:00 PM',
    type: 'meeting',
    location: 'Office',
    color: 'primary',
  },
];

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Calendar</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your schedule
            </p>
          </div>
        </div>
      </div>

      <AnimatedContainer animation="slideUp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <AnimatedContainer
                    key={event.id}
                    animation="slideUp"
                    delay={index * 0.1}
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div
                        className={`mt-1 h-10 w-10 rounded-lg flex items-center justify-center ${
                          event.type === 'deadline'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {event.type === 'deadline' ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <Video className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AnimatedContainer>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slideUp" delay={0.2}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Google Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Google Calendar to automatically sync events and manage your
                  schedule directly from this dashboard.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-medium">Ready to Connect</p>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Sync Type</p>
                    <p className="text-sm font-medium">Bi-directional</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Google Calendar API integration will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
