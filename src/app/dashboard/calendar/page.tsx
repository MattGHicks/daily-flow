'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { CalendarView } from '@/components/features/calendar/calendar-view';
import { CalendarEvent } from '@/components/features/calendar/event-card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarPageContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/google/calendar/auth', {
        method: 'POST',
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      return data.authenticated;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  // Fetch events from Google Calendar
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/google/calendar/events');
      const data = await response.json();

      if (data.success && data.events) {
        setEvents(data.events);
      } else if (data.authenticated === false) {
        setIsAuthenticated(false);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication
  const handleAuthenticate = async () => {
    try {
      const response = await fetch('/api/google/calendar/auth');
      const data = await response.json();

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to start authentication');
      }
    } catch (error) {
      console.error('Error authenticating:', error);
      setError('Failed to start authentication');
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check for success/error params from OAuth callback
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (success === 'true') {
        // Authentication successful
        setIsAuthenticated(true);
        // Clear the query params
        window.history.replaceState({}, '', '/dashboard/calendar');
      } else if (error) {
        setError('Authentication failed: ' + error);
        window.history.replaceState({}, '', '/dashboard/calendar');
      }

      // Check authentication and fetch events
      const isAuth = await checkAuth();
      if (isAuth) {
        await fetchEvents();
      } else {
        setIsLoading(false);
      }
    };

    init();
  }, [searchParams]);

  const handleRefresh = async () => {
    await fetchEvents();
  };

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
              View your Google Calendar events (Read-only)
            </p>
          </div>
        </div>
      </div>

      <AnimatedContainer animation="slideUp">
        {error && (
          <Card className="p-4 border-destructive/50 bg-destructive/10 mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {isLoading && isAuthenticated ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <CalendarView
            events={events}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            onRefresh={handleRefresh}
            onAuthenticate={handleAuthenticate}
          />
        )}
      </AnimatedContainer>

      {/* Statistics Card */}
      {isAuthenticated && events.length > 0 && (
        <AnimatedContainer animation="slideUp" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold">{events.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </Card>

            <Card className="p-4">
              <div className="text-2xl font-bold">
                {events.filter(e => {
                  const eventDate = new Date(e.start);
                  const today = new Date();
                  return eventDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </Card>

            <Card className="p-4">
              <div className="text-2xl font-bold">
                {events.filter(e => {
                  const eventDate = new Date(e.start);
                  const today = new Date();
                  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate >= today && eventDate <= nextWeek;
                }).length}
              </div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </Card>

            <Card className="p-4">
              <div className="text-2xl font-bold">
                {events.filter(e => e.conferenceData).length}
              </div>
              <div className="text-xs text-muted-foreground">Video Meetings</div>
            </Card>
          </div>
        </AnimatedContainer>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <CalendarPageContent />
    </Suspense>
  );
}