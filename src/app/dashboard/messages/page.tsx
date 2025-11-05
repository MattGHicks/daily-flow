'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/shared/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { MessageThread } from '@/types/message';
import { mockMessageThreads } from '@/lib/data/mock-messages';
import Link from 'next/link';

export default function MessagesPage() {
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfiguration, setNeedsConfiguration] = useState(false);
  const [redmineUrl, setRedmineUrl] = useState<string>('');

  const fetchMessages = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const endpoint = refresh ? '/api/redmine/issues' : '/api/redmine/issues';
      const method = refresh ? 'POST' : 'GET';

      const response = await fetch(endpoint, { method });
      const result = await response.json();

      if (result.success) {
        setMessageThreads(result.data);
        setNeedsConfiguration(false);
        if (result.redmineUrl) {
          setRedmineUrl(result.redmineUrl);
        }
      } else if (result.needsConfiguration) {
        // Redmine not configured, use mock data
        setMessageThreads(mockMessageThreads);
        setNeedsConfiguration(true);
      } else {
        throw new Error(result.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      // Fall back to mock data on error
      setMessageThreads(mockMessageThreads);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchMessages(true);
  };

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
        {/* Loading State */}
        {isLoading ? (
          <AnimatedContainer animation="slideUp">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          </AnimatedContainer>
        ) : (
          <>
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
              <div className="flex items-center justify-between">
                <CardTitle>Active Messages</CardTitle>
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
            </CardHeader>
            <CardContent>
              {messageThreads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No message threads found
                </div>
              ) : (
                <div className="space-y-3">
                  {messageThreads.map((thread, index) => {
                    const threadContent = (
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
                              {thread.redmineUrl && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
                              {thread.redmineStatus && (
                                <span className="flex items-center gap-1">
                                  {thread.redmineStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );

                    // If thread has Redmine URL, make it a link
                    if (thread.redmineUrl) {
                      return (
                        <a
                          key={thread.id}
                          href={thread.redmineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {threadContent}
                        </a>
                      );
                    }

                    return threadContent;
                  })}
                </div>
              )}
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
                {needsConfiguration ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Connect to your Redmine instance to automatically sync client message
                      threads and track response times.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="text-sm font-medium text-orange-500">Not Configured</p>
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Data Source</p>
                        <p className="text-sm font-medium">Mock Data</p>
                      </div>
                    </div>
                    <Link href="/dashboard/settings">
                      <Button className="w-full">
                        Configure Redmine Integration
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Connected to Redmine. Automatically syncing client message threads
                      and tracking response times.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="text-sm font-medium text-green-500">Connected</p>
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Instance</p>
                        <p className="text-sm font-medium truncate">{redmineUrl}</p>
                      </div>
                    </div>
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive">{error}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
          </>
        )}
      </div>
    </>
  );
}
