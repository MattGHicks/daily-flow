'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  FolderOpen,
  MessageSquare,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { staggerContainer } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/dashboard');
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case 'projects':
        return FolderOpen;
      case 'messages':
        return MessageSquare;
      case 'tasks':
        return CheckCircle2;
      case 'calendar':
        return Calendar;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in-progress':
      case 'working on it':
        return 'bg-primary/10 text-primary';
      case 'review':
        return 'bg-purple-500/10 text-purple-500';
      case 'todo':
      case 'stuck':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {dashboardData?.stats?.map((stat: any, index: number) => {
          const Icon = getStatIcon(stat.icon);
          return (
            <AnimatedContainer
              key={stat.title}
              animation="slideUp"
              delay={index * 0.1}
            >
              <Card className="hover:bg-card/80 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          );
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <AnimatedContainer animation="slideUp" delay={0.4}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Tasks</CardTitle>
              <Link href="/dashboard/tasks">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentTasks?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active tasks
                </p>
              ) : (
                <div className="space-y-3">
                  {dashboardData?.recentTasks?.map((task: any) => (
                    <motion.div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.priority === 'high' && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        {task.deadline && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Messages Widget */}
        <AnimatedContainer animation="slideUp" delay={0.5}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Messages</CardTitle>
              <Link href="/dashboard/messages">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.analytics?.messagesNeedingResponse > 0 && (
                <div className="mb-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">
                      {dashboardData.analytics.messagesNeedingResponse} need response
                    </span>
                  </div>
                </div>
              )}
              {dashboardData?.recentMessages?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent messages
                </p>
              ) : (
                <div className="space-y-3">
                  {dashboardData?.recentMessages?.slice(0, 3).map((message: any) => (
                    <motion.div
                      key={message.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{message.client}</p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {message.subject}
                          </p>
                        </div>
                        {message.needsResponse && (
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-500">
                            Reply
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Quick Overview Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Widget */}
        <AnimatedContainer animation="slideUp" delay={0.6}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Projects</CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentProjects?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active projects
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboardData?.recentProjects?.slice(0, 4).map((project: any) => (
                    <div key={project.id} className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {project.board}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Calendar/Events Widget */}
        <AnimatedContainer animation="slideUp" delay={0.65}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" size="sm">
                  Calendar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.upcomingEvents?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming deadlines
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboardData?.upcomingEvents?.slice(0, 4).map((event: any) => (
                    <div key={event.id} className="p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {event.date ? new Date(event.date).toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Analytics Widget */}
        <AnimatedContainer animation="slideUp" delay={0.7}>
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-bold text-primary">
                    {dashboardData?.analytics?.completionRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasks This Week</span>
                  <span className="text-sm font-bold text-green-500">
                    {dashboardData?.analytics?.tasksCompletedThisWeek || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Productivity Score</span>
                  <span className="text-sm font-bold text-blue-500">
                    {dashboardData?.analytics?.productivityScore || 0}
                  </span>
                </div>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Full Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
