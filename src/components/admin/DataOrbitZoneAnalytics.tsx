import { useEffect, useState } from "react";
import { dataOrbitZoneClient } from "@/integrations/dataorbitzone/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

const DataOrbitZoneAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPageViews: 0,
    totalClicks: 0,
    blogClicks: 0,
    relatedSearchClicks: 0
  });
  const [countryFilter, setCountryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionDetails, setSessionDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAnalytics();
  }, [countryFilter, sourceFilter]);

  const fetchAnalytics = async () => {
    let query = dataOrbitZoneClient
      .from('analytics')
      .select('*, blogs(title, serial_number), related_searches(search_text)')
      .order('created_at', { ascending: false });
    
    if (countryFilter) {
      query = query.eq('country', countryFilter);
    }
    if (sourceFilter) {
      query = query.eq('source', sourceFilter);
    }

    const { data } = await query;
    
    if (data) {
      setAnalytics(data);
      
      // Calculate stats
      const sessions = new Set(data.map(d => d.session_id));
      const pageViews = data.filter(d => d.event_type === 'page_view').length;
      const blogClicks = data.filter(d => d.event_type === 'blog_click').length;
      const relatedSearchClicks = data.filter(d => d.event_type === 'related_search_click').length;
      
      setStats({
        totalSessions: sessions.size,
        totalPageViews: pageViews,
        totalClicks: blogClicks + relatedSearchClicks,
        blogClicks,
        relatedSearchClicks
      });
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
        const { data } = await dataOrbitZoneClient
          .from('analytics')
          .select('*, blogs(title, serial_number), related_searches(search_text)')
          .eq('session_id', sessionId);
        
        setSessionDetails(prev => ({
          ...prev,
          [sessionId]: data || []
        }));
      }
    }
  };

  const getSessionsBySessionId = () => {
    const sessionMap = new Map();
    
    analytics.forEach(item => {
      if (!sessionMap.has(item.session_id)) {
        sessionMap.set(item.session_id, {
          session_id: item.session_id,
          ip_address: item.ip_address,
          country: item.country,
          device: item.device,
          source: item.source,
          created_at: item.created_at,
          events: []
        });
      }
      sessionMap.get(item.session_id).events.push(item);
    });
    
    return Array.from(sessionMap.values());
  };

  const sessions = getSessionsBySessionId();

  const getSessionStats = (events: any[]) => {
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const blogClicks = events.filter(e => e.event_type === 'blog_click').length;
    const relatedSearchClicks = events.filter(e => e.event_type === 'related_search_click').length;
    
    return { pageViews, blogClicks, relatedSearchClicks, total: pageViews + blogClicks + relatedSearchClicks };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">DataOrbitZone Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Blog Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.blogClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Related Search Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.relatedSearchClicks}</div>
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
                  <TableHead>Blog Clicks</TableHead>
                  <TableHead>Related Searches</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 20).map((session) => {
                  const isExpanded = expandedSessions.has(session.session_id);
                  const details = sessionDetails[session.session_id];
                  const sessionStats = getSessionStats(session.events);
                  
                  return (
                    <>
                      <TableRow key={session.session_id} className="cursor-pointer hover:bg-muted/50">
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
                          {sessionStats.pageViews > 0 ? (
                            <Badge className="bg-blue-500/10 text-blue-600">
                              {sessionStats.pageViews}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {sessionStats.blogClicks > 0 ? (
                            <Badge className="bg-orange-500/10 text-orange-600">
                              {sessionStats.blogClicks}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {sessionStats.relatedSearchClicks > 0 ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              {sessionStats.relatedSearchClicks}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()} {new Date(session.created_at).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                      {isExpanded && details && (
                        <TableRow>
                          <TableCell colSpan={10} className="bg-muted/30 p-6">
                            <div className="space-y-6">
                              {/* Page Views */}
                              {details.filter((d: any) => d.event_type === 'page_view').length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-semibold text-blue-600">Page Views</h4>
                                  </div>
                                  <div className="grid gap-2 ml-6">
                                    {details.filter((d: any) => d.event_type === 'page_view').map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm">
                                        <Badge className="bg-blue-500/10 text-blue-600">
                                          View
                                        </Badge>
                                        <span className="text-muted-foreground text-xs">
                                          {new Date(item.created_at).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Blog Clicks */}
                              {details.filter((d: any) => d.event_type === 'blog_click').length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ChevronDown className="h-4 w-4 text-orange-600" />
                                    <h4 className="font-semibold text-orange-600">Blog Clicks</h4>
                                  </div>
                                  <div className="grid gap-2 ml-6">
                                    {details.filter((d: any) => d.event_type === 'blog_click').map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm">
                                        <Badge className="bg-orange-500/10 text-orange-600">
                                          Click
                                        </Badge>
                                        <span className="font-medium">
                                          {item.blogs?.title || 'Unknown Blog'}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                          {new Date(item.created_at).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Related Search Clicks */}
                              {details.filter((d: any) => d.event_type === 'related_search_click').length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ChevronDown className="h-4 w-4 text-green-600" />
                                    <h4 className="font-semibold text-green-600">Related Search Clicks</h4>
                                  </div>
                                  <div className="grid gap-2 ml-6">
                                    {details.filter((d: any) => d.event_type === 'related_search_click').map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm">
                                        <Badge className="bg-green-500/10 text-green-600">
                                          Click
                                        </Badge>
                                        <span className="font-medium">
                                          {item.related_searches?.search_text || 'Unknown Search'}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                          {new Date(item.created_at).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {details.length === 0 && (
                                <p className="text-muted-foreground text-sm">No detailed activity for this session</p>
                              )}
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

export default DataOrbitZoneAnalytics;
