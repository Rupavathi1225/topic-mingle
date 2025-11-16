import { useEffect, useState } from "react";
import { webResultsClient } from "@/integrations/webresults/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

const WebResultsAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [clickEvents, setClickEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPageViews: 0,
    totalClicks: 0,
    relatedSearches: 0,
    resultClicks: 0,
    avgTimeSpent: 0
  });
  const [countryFilter, setCountryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionDetails, setSessionDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAnalytics();
  }, [countryFilter, sourceFilter]);

  const fetchAnalytics = async () => {
    let analyticsQuery = webResultsClient
      .from('analytics')
      .select('*')
      .order('timestamp', { ascending: false });
    
    let clicksQuery = webResultsClient
      .from('click_events')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (countryFilter) {
      analyticsQuery = analyticsQuery.eq('country', countryFilter);
      clicksQuery = clicksQuery.eq('country', countryFilter);
    }
    if (sourceFilter) {
      analyticsQuery = analyticsQuery.eq('source', sourceFilter);
    }

    const { data: analyticsData } = await analyticsQuery;
    const { data: clicksData } = await clicksQuery;
    
    if (analyticsData) {
      setAnalytics(analyticsData);
      
      const totalPageViews = analyticsData.reduce((sum, item) => sum + (item.page_views || 0), 0);
      const totalClicks = analyticsData.reduce((sum, item) => sum + (item.clicks || 0), 0);
      const relatedSearches = analyticsData.reduce((sum, item) => sum + (item.related_searches || 0), 0);
      const resultClicks = analyticsData.reduce((sum, item) => sum + (item.result_clicks || 0), 0);
      const avgTime = analyticsData.reduce((sum, item) => sum + (item.time_spent || 0), 0) / analyticsData.length;
      
      setStats({
        totalSessions: analyticsData.length,
        totalPageViews,
        totalClicks,
        relatedSearches,
        resultClicks,
        avgTimeSpent: Math.round(avgTime / 1000) // Convert to seconds
      });
    }
    
    if (clicksData) {
      setClickEvents(clicksData);
    }
  };

  const toggleSessionExpand = async (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
      setExpandedSessions(newExpanded);
    } else {
      newExpanded.add(sessionId);
      setExpandedSessions(newExpanded);
      
      if (!sessionDetails[sessionId]) {
        const { data } = await webResultsClient
          .from('click_events')
          .select('*')
          .eq('session_id', sessionId);
        
        setSessionDetails(prev => ({
          ...prev,
          [sessionId]: data || []
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Web Results Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalPageViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Related Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.relatedSearches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Result Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.resultClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Time (s)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.avgTimeSpent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <div className="flex gap-2">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">USA</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="GB">UK</SelectItem>
                  </SelectContent>
                </Select>
                {countryFilter && (
                  <Button variant="outline" onClick={() => setCountryFilter("")}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <div className="flex gap-2">
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="meta">Meta</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
                {sourceFilter && (
                  <Button variant="outline" onClick={() => setSourceFilter("")}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Page Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Related Searches</TableHead>
                  <TableHead>Result Clicks</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.slice(0, 20).map((session) => {
                  const isExpanded = expandedSessions.has(session.session_id);
                  const details = sessionDetails[session.session_id];
                  
                  return (
                    <>
                      <TableRow key={session.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell onClick={() => toggleSessionExpand(session.session_id)}>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {session.session_id.substring(0, 12)}...
                        </TableCell>
                        <TableCell>{session.ip_address}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{session.country || 'WW'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{session.source || 'direct'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{session.device || 'Desktop'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/10 text-blue-600">
                            {session.page_views || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500/10 text-purple-600">
                            {session.clicks || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/10 text-green-600">
                            {session.related_searches || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-orange-500/10 text-orange-600">
                            {session.result_clicks || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {Math.round((session.time_spent || 0) / 1000)}s
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                      {isExpanded && details && details.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={12} className="bg-muted/30 p-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold">Click Events</h4>
                              <div className="grid gap-2">
                                {details.map((event: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 text-sm">
                                    <Badge className="bg-purple-500/10 text-purple-600">
                                      {event.event_type}
                                    </Badge>
                                    {event.search_term && (
                                      <span className="font-medium">{event.search_term}</span>
                                    )}
                                    {event.target_url && (
                                      <span className="text-muted-foreground truncate max-w-xs">
                                        {event.target_url}
                                      </span>
                                    )}
                                    <span className="text-muted-foreground text-xs ml-auto">
                                      {new Date(event.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebResultsAnalytics;
