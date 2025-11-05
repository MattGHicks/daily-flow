'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import { TrendingUp, Clock, CheckCircle2, Target, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Track your productivity and performance
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedContainer animation="slideUp">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-bold mt-1">127</p>
                    <p className="text-xs text-green-500 mt-1">+12% this week</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer animation="slideUp" delay={0.1}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Time Tracked</p>
                    <p className="text-2xl font-bold mt-1">42.5h</p>
                    <p className="text-xs text-green-500 mt-1">+8% this week</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer animation="slideUp" delay={0.2}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold mt-1">3.2h</p>
                    <p className="text-xs text-green-500 mt-1">-15% improvement</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer animation="slideUp" delay={0.3}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Goal Progress</p>
                    <p className="text-2xl font-bold mt-1">85%</p>
                    <p className="text-xs text-primary mt-1">Weekly target</p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Time Distribution */}
        <AnimatedContainer animation="slideUp" delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Development', hours: 18.5, percentage: 43, color: 'primary' },
                  { label: 'Client Communication', hours: 8.2, percentage: 19, color: 'secondary' },
                  { label: 'Planning & Design', hours: 10.3, percentage: 24, color: 'chart-3' },
                  { label: 'Meetings', hours: 5.5, percentage: 13, color: 'chart-4' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.hours}h</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Productivity Insights */}
        <AnimatedContainer animation="slideUp" delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Peak Productivity Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Your most productive time is between 9:00 AM - 12:00 PM. Consider
                    scheduling deep work sessions during these hours.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Task Completion Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    You complete 92% of tasks you plan for the day. Great consistency!
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Client Response SLA</h4>
                  <p className="text-sm text-muted-foreground">
                    Average response time is 3.2 hours, which is 35% faster than your target
                    SLA. Excellent work!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
  );
}
