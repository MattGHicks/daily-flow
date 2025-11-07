import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

// Temporary user ID for development
const DEV_USER_ID = 'dev-user-001';

/**
 * GET /api/dashboard
 * Aggregates data from multiple sources for the dashboard
 */
export async function GET() {
  try {
    // Get current date info
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Fetch user settings to check integrations
    const settings = await prisma.userSettings.findUnique({
      where: { userId: DEV_USER_ID },
    });

    // 1. FETCH TASKS DATA
    const tasks = await prisma.task.findMany({
      where: { userId: DEV_USER_ID },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate task statistics
    const tasksCompletedToday = tasks.filter(
      task => task.status === 'done' &&
      new Date(task.updatedAt) >= startOfToday
    ).length;

    const tasksCompletedThisWeek = tasks.filter(
      task => task.status === 'done' &&
      new Date(task.updatedAt) >= startOfWeek
    ).length;

    const tasksByStatus = {
      backlog: tasks.filter(t => t.status === 'backlog').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
    };

    // Get upcoming tasks with deadlines
    const upcomingTasks = tasks
      .filter(t => t.deadline && new Date(t.deadline) > new Date() && t.status !== 'done')
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 5);

    // 2. FETCH PROJECTS DATA (Monday.com)
    let activeProjectsCount = 0;
    let recentProjects = [];

    if (settings?.mondayApiKey) {
      try {
        const projectsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/monday/projects`);
        const projectsData = await projectsResponse.json();

        if (projectsData.success) {
          const projects = projectsData.data;
          // Count active projects (not completed)
          activeProjectsCount = projects.filter((p: any) =>
            p.status?.toLowerCase() !== 'completed' &&
            p.status?.toLowerCase() !== 'done'
          ).length;

          // Get 5 most recent projects
          recentProjects = projects.slice(0, 5).map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            board: p.board,
          }));
        }
      } catch (error) {
        console.error('Error fetching Monday.com projects:', error);
      }
    }

    // 3. FETCH MESSAGES DATA (Redmine)
    let messagesNeedingResponse = 0;
    let recentMessages = [];

    if (settings?.redmineApiKey) {
      try {
        const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/redmine/issues`);
        const messagesData = await messagesResponse.json();

        if (messagesData.success) {
          const messages = messagesData.data;
          messagesNeedingResponse = messages.filter((m: any) => m.needsResponse).length;

          // Get 5 most recent messages
          recentMessages = messages.slice(0, 5).map((m: any) => ({
            id: m.id,
            client: m.client,
            subject: m.subject,
            needsResponse: m.needsResponse,
            timestamp: m.timestamp,
          }));
        }
      } catch (error) {
        console.error('Error fetching Redmine messages:', error);
      }
    }

    // 4. FETCH GOOGLE CALENDAR EVENTS
    let upcomingCalendarEvents = [];
    let calendarEventsCount = 0;

    if (settings?.googleRefreshToken) {
      try {
        const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/google/calendar/events`);
        const calendarData = await calendarResponse.json();

        if (calendarData.success && calendarData.events) {
          // Get upcoming events (not in the past)
          const futureEvents = calendarData.events.filter((event: any) => {
            const eventStart = new Date(event.start);
            return eventStart > new Date();
          });

          calendarEventsCount = futureEvents.length;

          // Get next 5 upcoming events
          upcomingCalendarEvents = futureEvents
            .slice(0, 5)
            .map((event: any) => ({
              id: event.id,
              title: event.title,
              date: event.start,
              type: 'calendar-event',
              calendarName: event.calendarName,
              location: event.location,
              allDay: event.allDay,
            }));
        }
      } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
      }
    }

    // 5. CALCULATE ANALYTICS
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0
      ? Math.round((tasksByStatus.done / totalTasks) * 100)
      : 0;

    // Calculate average time in each status (simplified)
    const productivityScore = Math.min(100, Math.round(
      (tasksCompletedThisWeek * 10) + (completionRate * 0.5)
    ));

    // 6. PREPARE DASHBOARD DATA
    const dashboardData = {
      stats: [
        {
          title: 'Active Projects',
          value: activeProjectsCount.toString(),
          change: null, // Could calculate week-over-week change
          icon: 'projects',
        },
        {
          title: 'Messages Need Response',
          value: messagesNeedingResponse.toString(),
          change: messagesNeedingResponse > 0 ? `${messagesNeedingResponse} pending` : 'All caught up',
          icon: 'messages',
        },
        {
          title: 'Tasks Completed',
          value: tasksCompletedToday.toString(),
          change: `${tasksCompletedThisWeek} this week`,
          icon: 'tasks',
        },
        {
          title: 'Upcoming Events',
          value: calendarEventsCount.toString(),
          change: calendarEventsCount > 0
            ? `${calendarEventsCount} in next 90 days`
            : 'None scheduled',
          icon: 'calendar',
        },
      ],

      recentTasks: tasks
        .filter(t => t.status !== 'done')
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority || 'medium',
          deadline: task.deadline,
        })),

      upcomingEvents: [
        // Combine calendar events and task deadlines
        ...upcomingCalendarEvents,
        ...upcomingTasks.map(task => ({
          id: task.id,
          title: task.title,
          date: task.deadline,
          type: 'task-deadline',
        })),
      ]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),

      tasksByStatus,

      recentProjects,

      recentMessages,

      analytics: {
        tasksCompletedToday,
        tasksCompletedThisWeek,
        completionRate,
        productivityScore,
        totalTasks,
        activeProjects: activeProjectsCount,
        messagesNeedingResponse,
      },

      integrations: {
        mondayConnected: !!settings?.mondayApiKey,
        redmineConnected: !!settings?.redmineApiKey,
        googleConnected: !!settings?.googleClientId,
        spotifyConnected: !!settings?.spotifyClientId,
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error aggregating dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}