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

  const needsResponseCount = messageThreads.filter(
    (t) => t.needsResponse === true
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
        <div className="grid gap-4 md:grid-cols-1 max-w-xs">
          <AnimatedContainer animation="slideUp">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Needs Response</p>
                    <p className="text-2xl font-bold mt-1">{needsResponseCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Message Threads */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Messages</h2>
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

          {messageThreads.length === 0 ? (
            <AnimatedContainer animation="slideUp" delay={0.1}>
              <Card>
                <CardContent className="p-12">
                  <div className="text-center text-muted-foreground">
                    No message threads found
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {messageThreads.map((thread, index) => {
                const cardContent = (
                  <AnimatedContainer animation="slideUp" delay={index * 0.05} key={thread.id}>
                    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                      <Card
                        className={`h-full cursor-pointer transition-all ${
                          thread.needsResponse
                            ? 'bg-orange-500/10 hover:bg-orange-500/15 border-orange-500/30 hover:border-orange-500/50'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base mb-1 truncate">
                                {thread.client}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {thread.subject}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {thread.priority === 'high' && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                              {thread.redmineUrl && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          {thread.needsResponse && (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-medium">
                                <AlertCircle className="h-3 w-3" />
                                Needs Response
                              </span>
                            </div>
                          )}

                          {/* Last Message */}
                          <div className="mb-3 min-h-[60px]">
                            <div className="flex items-start gap-2 mb-1">
                              <span className={`text-xs font-semibold ${
                                thread.lastMessageSentByMe
                                  ? 'text-primary'
                                  : 'text-orange-600 dark:text-orange-400'
                              }`}>
                                {thread.lastMessageSentByMe ? 'You' : thread.lastMessageAuthor}:
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 line-clamp-2">
                              {thread.lastMessage}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {thread.timestamp}
                            </span>
                            {thread.redmineStatus && (
                              <span className="truncate ml-2">
                                {thread.redmineStatus}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatedContainer>
                );

                // If thread has Redmine URL, make it a link
                if (thread.redmineUrl) {
                  return (
                    <a
                      key={thread.id}
                      href={thread.redmineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {cardContent}
                    </a>
                  );
                }

                return cardContent;
              })}
            </div>
          )}
        </div>

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
