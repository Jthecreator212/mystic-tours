// Production monitoring dashboard
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Globe,
    TrendingUp,
    Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: string;
      responseTime: number;
      error?: string;
    };
    environment: {
      status: string;
      variables: Record<string, boolean>;
    };
    external: Record<string, unknown>;
  };
  checks: Record<string, boolean>;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  averageSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  recentEvents: Array<{ event: string; timestamp: string; count: number }>;
}

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
}

export function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Error fetching health status:', error);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  // Fetch performance metrics
  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/performance');
      const data = await response.json();
      setPerformanceMetrics(data);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchHealthStatus(),
      fetchAnalyticsData(),
      fetchPerformanceMetrics(),
    ]);
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading && !healthStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshData} disabled={isLoading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                {healthStatus && getStatusIcon(healthStatus.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthStatus?.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {healthStatus ? formatUptime(healthStatus.uptime) : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.pageViews.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.uniqueVisitors.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.conversionRate.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Bookings per visitor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          {performanceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Core Web Vitals and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceMetrics.lcp.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">LCP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceMetrics.fid.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">FID</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {performanceMetrics.cls.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">CLS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {performanceMetrics.ttfb.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">TTFB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {performanceMetrics.fcp.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">FCP</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>Real-time performance metrics and optimization</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceMetrics ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceMetrics.lcp.toFixed(0)}ms
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((performanceMetrics.lcp / 2500) * 100, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: &lt; 2.5s
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">First Input Delay (FID)</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceMetrics.fid.toFixed(0)}ms
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((performanceMetrics.fid / 100) * 100, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: &lt; 100ms
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
                      <span className="text-sm text-muted-foreground">
                        {performanceMetrics.cls.toFixed(3)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((performanceMetrics.cls / 0.1) * 100, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: &lt; 0.1
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.topPages ? (
                  <div className="space-y-2">
                    {analyticsData.topPages.slice(0, 5).map((page, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm truncate">{page.path}</span>
                        <Badge variant="secondary">{page.views}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No page view data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.recentEvents ? (
                  <div className="space-y-2">
                    {analyticsData.recentEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{event.event}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No event data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Service status and environment checks</CardDescription>
            </CardHeader>
            <CardContent>
              {healthStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Services</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database</span>
                          <Badge variant={healthStatus.services.database.status === 'healthy' ? 'default' : 'destructive'}>
                            {healthStatus.services.database.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Environment</span>
                          <Badge variant={healthStatus.services.environment.status === 'healthy' ? 'default' : 'destructive'}>
                            {healthStatus.services.environment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Telegram</span>
                          <Badge variant={healthStatus.services.external.telegram ? 'default' : 'destructive'}>
                            {healthStatus.services.external.telegram ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">System Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span>{healthStatus.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Environment:</span>
                          <span>{healthStatus.environment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span>{formatUptime(healthStatus.uptime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Check:</span>
                          <span>{new Date(healthStatus.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {healthStatus.services.database.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <h5 className="font-medium text-red-800 mb-1">Database Error</h5>
                      <p className="text-sm text-red-600">{healthStatus.services.database.error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Unable to fetch health status
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 