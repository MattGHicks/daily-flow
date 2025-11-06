'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/shared/animated-container';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  BarChart3,
  Activity,
  Briefcase,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface AnalyticsData {
  metrics: {
    tasksCompleted: number;
    weekTasks: number;
    monthTasks: number;
    totalTasks: number;
    completionRate: number;
    activeProjects: number;
    totalTime: number;
    responseTime: number;
    goalProgress: number;
    redmineIssues: number;
  };
  trends: {
    tasksTrend: string;
    timeTrend: string;
    responseTrend: string;
  };
  taskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  timeDistribution: Array<{
    label: string;
    hours: number;
    percentage: number;
    color: string;
  }>;
  activityHeatmap: Array<{
    date: string;
    value: number;
  }>;
  productivityPatterns: Array<{
    hour: string;
    tasks: number;
  }>;
  projectInsights: Array<{
    id: string;
    name: string;
    status: string;
    tasksCount: number;
    completedTasks: number;
  }>;
  insights: {
    peakHours: string;
    completionRate: string;
    avgResponseTime: string;
    suggestion: string;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/analytics');
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatTrend = (trend: string) => {
    const isPositive = trend.startsWith('+');
    const isNegative = trend.startsWith('-');
    const className = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground';
    return <span className={className}>{trend}</span>;
  };

  if (isLoading) {
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-muted-foreground mb-4">{error || 'Something went wrong'}</p>
          <Button onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
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
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
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
                  <p className="text-2xl font-bold mt-1">{data.metrics.tasksCompleted}</p>
                  <p className="text-xs mt-1">{formatTrend(data.trends.tasksTrend)} this week</p>
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
                  <p className="text-2xl font-bold mt-1">{data.metrics.totalTime.toFixed(1)}h</p>
                  <p className="text-xs mt-1">{formatTrend(data.trends.timeTrend)} this week</p>
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
                  <p className="text-2xl font-bold mt-1">{data.metrics.responseTime}h</p>
                  <p className="text-xs mt-1">{formatTrend(data.trends.responseTrend)} improvement</p>
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
                  <p className="text-2xl font-bold mt-1">{data.metrics.goalProgress}%</p>
                  <p className="text-xs text-primary mt-1">Weekly target</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Distribution Pie Chart */}
        <AnimatedContainer animation="slideUp" delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Productivity Patterns Line Chart */}
        <AnimatedContainer animation="slideUp" delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle>Daily Productivity Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.productivityPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Activity Heatmap */}
      <AnimatedContainer animation="slideUp" delay={0.6}>
        <Card>
          <CardHeader>
            <CardTitle>30-Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.activityHeatmap}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Time Distribution */}
      <AnimatedContainer animation="slideUp" delay={0.7}>
        <Card>
          <CardHeader>
            <CardTitle>Time Distribution (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.timeDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.hours}h</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Project Insights */}
      <AnimatedContainer animation="slideUp" delay={0.8}>
        <Card>
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.projectInsights}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completedTasks" fill="#10B981" name="Completed" />
                <Bar dataKey="tasksCount" fill="#3B82F6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Productivity Insights */}
      <AnimatedContainer animation="slideUp" delay={0.9}>
        <Card>
          <CardHeader>
            <CardTitle>Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                <Activity className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">Peak Productivity Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Your most productive time is {data.insights.peakHours}. Consider
                    scheduling deep work sessions during these hours.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">Task Completion Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    You complete {data.insights.completionRate} of tasks you plan. Great consistency!
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">Client Response SLA</h4>
                  <p className="text-sm text-muted-foreground">
                    Average response time is {data.insights.avgResponseTime}, which is 35% faster than your target
                    SLA. Excellent work!
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">Suggestion</h4>
                  <p className="text-sm text-muted-foreground">
                    {data.insights.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Summary Stats */}
      <AnimatedContainer animation="slideUp" delay={1.0}>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{data.metrics.activeProjects}</p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{data.metrics.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{data.metrics.weekTasks}</p>
                <p className="text-xs text-muted-foreground">Week Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{data.metrics.monthTasks}</p>
                <p className="text-xs text-muted-foreground">Month Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{data.metrics.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}