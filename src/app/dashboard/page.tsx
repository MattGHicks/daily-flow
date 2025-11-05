'use client';

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
} from 'lucide-react';
import { staggerContainer } from '@/lib/animations';

const stats = [
  {
    name: 'Active Projects',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Activity,
    description: '3 due this week',
  },
  {
    name: 'Unread Messages',
    value: '8',
    change: '-3',
    trend: 'down',
    icon: Users,
    description: '2 require response',
  },
  {
    name: 'Tasks Completed',
    value: '45',
    change: '+12',
    trend: 'up',
    icon: CheckCircle2,
    description: 'This week',
  },
  {
    name: 'Upcoming Deadlines',
    value: '5',
    change: '0',
    trend: 'neutral',
    icon: Clock,
    description: 'Next 7 days',
  },
];

const recentTasks = [
  { id: 1, title: 'Review client proposal', project: 'Acme Inc.', status: 'completed', priority: 'high' },
  { id: 2, title: 'Update website design', project: 'WebCorp', status: 'in-progress', priority: 'medium' },
  { id: 3, title: 'Fix authentication bug', project: 'TechStart', status: 'in-progress', priority: 'high' },
  { id: 4, title: 'Schedule team meeting', project: 'Internal', status: 'pending', priority: 'low' },
];

const upcomingEvents = [
  { id: 1, title: 'Client call with Acme', time: 'Today, 2:00 PM', type: 'meeting' },
  { id: 2, title: 'Project deadline: Website redesign', time: 'Tomorrow, 5:00 PM', type: 'deadline' },
  { id: 3, title: 'Weekly planning session', time: 'Friday, 10:00 AM', type: 'meeting' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
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
      </div>

      {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedContainer
                key={stat.name}
                animation="slideUp"
                delay={index * 0.1}
              >
                <Card className="hover:bg-card/80 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.name}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {stat.trend === 'up' && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      {stat.trend === 'down' && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : ''}>
                        {stat.change}
                      </span>
                      <span>{stat.description}</span>
                    </div>
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
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-500/10 text-green-500'
                              : task.status === 'in-progress'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {task.status}
                        </span>
                        {task.priority === 'high' && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Upcoming Events */}
          <AnimatedContainer animation="slideUp" delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div
                        className={`mt-0.5 h-2 w-2 rounded-full ${
                          event.type === 'deadline' ? 'bg-destructive' : 'bg-primary'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Daily Briefing */}
        <AnimatedContainer animation="slideUp" delay={0.6}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Daily Briefing</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Generated for today
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Priority Focus</h4>
                  <p className="text-sm text-muted-foreground">
                    You have 3 high-priority tasks due this week. Consider blocking focus time for
                    "Fix authentication bug" and "Review client proposal".
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Client Follow-ups</h4>
                  <p className="text-sm text-muted-foreground">
                    2 Redmine threads need responses. Last client message from Acme Inc. was 18 hours ago.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Time Allocation</h4>
                  <p className="text-sm text-muted-foreground">
                    Yesterday you spent 4.5 hours on development and 2 hours on client communication.
                    Consider scheduling more focus time blocks today.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
  );
}
