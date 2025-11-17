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

  const getRelatedSearchClicksBreakdown = (events: any[]) => {
    const clicksMap = new Map();
    
    events.filter(e => e.event_type === 'related_search_click' && e.related_searches).forEach(event => {
      const searchText = event.related_searches.search_text;
      if (!clicksMap.has(searchText)) {
        clicksMap.set(searchText, { total: 0, unique: new Set() });
      }
      clicksMap.get(searchText).total++;
      clicksMap.get(searchText).unique.add(event.ip_address);
    });
    
    return Array.from(clicksMap.entries()).map(([searchText, data]) => ({
      searchText,
      total: data.total,
      unique: data.unique.size
    }));
  };

  const getBlogClicksBreakdown = (events: any[]) => {
    const clicksMap = new Map();
    
    events.filter(e => e.event_type === 'blog_click' && e.blogs).forEach(event => {
      const blogTitle = event.blogs.serial_number 
        ? `[${event.blogs.serial_number}] ${event.blogs.title}`
        : event.blogs.title;
      if (!clicksMap.has(blogTitle)) {
        clicksMap.set(blogTitle, { total: 0, unique: new Set() });
      }
      clicksMap.get(blogTitle).total++;
      clicksMap.get(blogTitle).unique.add(event.ip_address);
    });
    
    return Array.from(clicksMap.entries()).map(([blogTitle, data]) => ({
      blogTitle,
      total: data.total,
      unique: data.unique.size
    }));
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
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
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
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const sessionStats = getSessionStats(session.events);
                return (
                  <>
                    <TableRow key={session.session_id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSessionExpand(session.session_id)}
                        >
                          {expandedSessions.has(session.session_id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {session.session_id.substring(0, 12)}...
                      </TableCell>
                      <TableCell>{session.ip_address || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.country || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{session.device || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{session.source || 'direct'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">
                            {sessionStats.pageViews} views
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50">
                            {sessionStats.blogClicks} blog
                          </Badge>
                          <Badge variant="outline" className="bg-green-50">
                            {sessionStats.relatedSearchClicks} search
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedSessions.has(session.session_id) && sessionDetails[session.session_id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Event Timeline</h4>
                              <div className="space-y-2">
                                {sessionDetails[session.session_id].map((event: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-4 text-sm">
                                    <Badge variant="outline">{event.event_type}</Badge>
                                    <span className="text-muted-foreground">
                                      {new Date(event.created_at).toLocaleString()}
                                    </span>
                                    {event.blogs && (
                                      <span className="text-foreground">
                                        {event.blogs.serial_number && `[${event.blogs.serial_number}] `}
                                        {event.blogs.title}
                                      </span>
                                    )}
                                    {event.related_searches && (
                                      <span className="text-foreground">{event.related_searches.search_text}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Blog Clicks</h4>
                              {getBlogClicksBreakdown(sessionDetails[session.session_id]).length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Blog Title</TableHead>
                                      <TableHead>Total Clicks</TableHead>
                                      <TableHead>Unique Clicks</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getBlogClicksBreakdown(sessionDetails[session.session_id]).map((click, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{click.blogTitle}</TableCell>
                                        <TableCell><Badge>{click.total}</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">{click.unique}</Badge></TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-sm text-muted-foreground">No blog clicks in this session</p>
                              )}
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Related Search Clicks</h4>
                              {getRelatedSearchClicksBreakdown(sessionDetails[session.session_id]).length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Search Text</TableHead>
                                      <TableHead>Total Clicks</TableHead>
                                      <TableHead>Unique Clicks</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getRelatedSearchClicksBreakdown(sessionDetails[session.session_id]).map((click, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{click.searchText}</TableCell>
                                        <TableCell><Badge>{click.total}</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">{click.unique}</Badge></TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-sm text-muted-foreground">No related search clicks in this session</p>
                              )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DataOrbitZoneAnalytics;
