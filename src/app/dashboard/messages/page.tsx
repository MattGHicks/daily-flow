'use client';

import { DashboardHeader } from '@/components/shared/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { MessageSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const messageThreads = [
  {
    id: 1,
    client: 'Acme Inc.',
    subject: 'Website Redesign Feedback',
    lastMessage: 'The new mockups look great! Just a few minor changes...',
    timestamp: '2 hours ago',
    unread: true,
    priority: 'high',
    responseTime: '18h ago',
  },
  {
    id: 2,
    client: 'TechStart',
    subject: 'Authentication Bug Report',
    lastMessage: 'Users are experiencing login issues after the update',
    timestamp: '5 hours ago',
    unread: true,
    priority: 'high',
    responseTime: '5h ago',
  },
  {
    id: 3,
    client: 'WebCorp',
    subject: 'Project Timeline Discussion',
    lastMessage: 'Thanks for the update. The timeline works perfectly.',
    timestamp: '1 day ago',
    unread: false,
    priority: 'medium',
    responseTime: 'Replied',
  },
  {
    id: 4,
    client: 'DesignCo',
    subject: 'New Feature Request',
    lastMessage: 'We\'d like to add a dark mode option to the dashboard',
    timestamp: '2 days ago',
    unread: false,
    priority: 'low',
    responseTime: 'Replied',
  },
];

export default function MessagesPage() {
  const unreadCount = messageThreads.filter((t) => t.unread).length;
  const needsResponseCount = messageThreads.filter(
    (t) => t.unread && t.priority === 'high'
  ).length;

  return (
    <>
      <DashboardHeader
        title="Messages"
        subtitle="Client communications from Redmine"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <AnimatedContainer animation="slideUp">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Unread Messages</p>
                    <p className="text-2xl font-bold mt-1">{unreadCount}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer animation="slideUp" delay={0.1}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Needs Response</p>
                    <p className="text-2xl font-bold mt-1">{needsResponseCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer animation="slideUp" delay={0.2}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold mt-1">4.2h</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Message Threads */}
        <AnimatedContainer animation="slideUp" delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Threads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messageThreads.map((thread, index) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{thread.client}</h4>
                          {thread.unread && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                          {thread.priority === 'high' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {thread.subject}
                        </p>
                        <p className="text-sm text-foreground/80 line-clamp-1">
                          {thread.lastMessage}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {thread.timestamp}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              thread.responseTime.includes('ago')
                                ? 'text-destructive'
                                : 'text-green-500'
                            }`}
                          >
                            {thread.responseTime.includes('ago') ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {thread.responseTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Integration Info */}
        <AnimatedContainer animation="slideUp" delay={0.4}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Redmine Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect to your Redmine instance to automatically sync client message
                  threads and track response times.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-medium">Ready to Connect</p>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">SLA Tracking</p>
                    <p className="text-sm font-medium">Enabled</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Redmine API integration will be implemented in the next phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </>
  );
}
