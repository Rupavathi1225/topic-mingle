import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

const AdminAnalytics = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [relatedSearchClicks, setRelatedSearchClicks] = useState<any[]>([]);
  const [blogClicks, setBlogClicks] = useState<any[]>([]);
  const [visitNowClicks, setVisitNowClicks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPageViews: 0,
    totalClicks: 0
  });
  const [countryFilter, setCountryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionDetails, setSessionDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAnalytics();
  }, [countryFilter, sourceFilter]);

  const fetchAnalytics = async () => {
    // Build query with filters
    let sessionQuery = supabase.from('analytics_sessions').select('*').order('created_at', { ascending: false });
    
    if (countryFilter) {
      sessionQuery = sessionQuery.eq('country', countryFilter);
    }
    if (sourceFilter) {
      sessionQuery = sessionQuery.eq('source', sourceFilter);
    }

    const { data: sessionsData } = await sessionQuery;
    if (sessionsData) setSessions(sessionsData);

    // Get stats
    const { data: pageViews } = await supabase.from('analytics_page_views').select('id');
    const { data: allBlogClicks } = await supabase
      .from('analytics_blog_clicks')
      .select('*, blogs(title, serial_number)');
    const { data: rsClicks } = await supabase
      .from('analytics_related_search_clicks')
      .select('*, related_searches(search_text, blogs(title, serial_number))');
    const { data: vnClicks } = await supabase
      .from('analytics_visit_now_clicks')
      .select('*, related_searches(search_text)');

    setStats({
      totalSessions: sessionsData?.length || 0,
      totalPageViews: pageViews?.length || 0,
      totalClicks: (allBlogClicks?.length || 0) + (rsClicks?.length || 0) + (vnClicks?.length || 0)
    });

    if (rsClicks) setRelatedSearchClicks(rsClicks);
    if (allBlogClicks) setBlogClicks(allBlogClicks);
    if (vnClicks) setVisitNowClicks(vnClicks);
  };

  const toggleSessionExpand = async (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
      setExpandedSessions(newExpanded);
    } else {
      newExpanded.add(sessionId);
      setExpandedSessions(newExpanded);
      
      // Fetch details for this session if not already loaded
      if (!sessionDetails[sessionId]) {
        const { data: rsClicks } = await supabase
          .from('analytics_related_search_clicks')
          .select('*, related_searches(search_text)')
          .eq('session_id', sessionId);
        
        const { data: bClicks } = await supabase
          .from('analytics_blog_clicks')
          .select('*, blogs(title, serial_number)')
          .eq('session_id', sessionId);

        const { data: vnClicks } = await supabase
          .from('analytics_visit_now_clicks')
          .select('*, related_searches(search_text)')
          .eq('session_id', sessionId);
        
        setSessionDetails(prev => ({
          ...prev,
          [sessionId]: {
            relatedSearchClicks: rsClicks || [],
            blogClicks: bClicks || [],
            visitNowClicks: vnClicks || []
          }
        }));
      }
    }
  };

  const getSessionClickCounts = (sessionId: string) => {
    const rsCount = relatedSearchClicks.filter(c => c.session_id === sessionId).length;
    const blogCount = blogClicks.filter(c => c.session_id === sessionId).length;
    const vnCount = visitNowClicks.filter(c => c.session_id === sessionId).length;
    return { rsCount, blogCount, vnCount, total: rsCount + blogCount + vnCount };
  };

  // Calculate unique clicks for related searches
  const getUniqueClicks = (searchId: string) => {
    const clicks = relatedSearchClicks.filter(c => c.related_search_id === searchId);
    const uniqueSessions = new Set(clicks.map(c => c.session_id));
    return {
      total: clicks.length,
      unique: uniqueSessions.size
    };
  };

  // Group related search clicks by search
  const groupedSearchClicks = relatedSearchClicks.reduce((acc, click) => {
    const key = click.related_search_id;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        text: click.related_searches?.search_text || '',
        blog: click.related_searches?.blogs?.title || '',
        serialNumber: click.related_searches?.blogs?.serial_number || 0,
        clicks: []
      };
    }
    acc[key].clicks.push(click);
    return acc;
  }, {} as Record<string, any>);

  // Group blog clicks by blog
  const groupedBlogClicks = blogClicks.reduce((acc, click) => {
    const key = click.blog_id || 'unknown';
    if (!acc[key]) {
      acc[key] = {
        id: key,
        title: click.blogs?.title || 'Unknown Blog',
        serialNumber: click.blogs?.serial_number || 0,
        clicks: []
      };
    }
    acc[key].clicks.push(click);
    return acc;
  }, {} as Record<string, any>);

  // Calculate unique clicks for blogs
  const getBlogUniqueClicks = (blogId: string) => {
    const clicks = blogClicks.filter(c => c.blog_id === blogId);
    const uniqueSessions = new Set(clicks.map(c => c.session_id));
    return {
      total: clicks.length,
      unique: uniqueSessions.size
    };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique visitors tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalPageViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Total pages viewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Buttons and links clicked</p>
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
                    <SelectItem value="WW">Worldwide</SelectItem>
                    <SelectItem value="US">USA</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
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

      {/* Blog Clicks */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blog Title</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Total Clicks</TableHead>
                <TableHead>Unique Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(groupedBlogClicks).length > 0 ? (
                Object.values(groupedBlogClicks).map((item: any) => {
                  const stats = getBlogUniqueClicks(item.id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.serialNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{stats.total}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stats.unique}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No blog clicks yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Related Search Clicks */}
      <Card>
        <CardHeader>
          <CardTitle>Related Search Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Text</TableHead>
                <TableHead>Blog</TableHead>
                <TableHead>Total Clicks</TableHead>
                <TableHead>Unique Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(groupedSearchClicks).length > 0 ? (
                Object.values(groupedSearchClicks).map((item: any) => {
                  const stats = getUniqueClicks(item.id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.text}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.serialNumber}</Badge> {item.blog}
                      </TableCell>
                      <TableCell>
                        <Badge>{stats.total}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stats.unique}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No related search clicks yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                  <TableHead>Blog Clicks</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 20).map((session) => {
                  const isExpanded = expandedSessions.has(session.session_id);
                  const details = sessionDetails[session.session_id];
                  const clickCounts = getSessionClickCounts(session.session_id);
                  
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
                        <TableCell>{clickCounts.total > 0 ? clickCounts.total : '-'}</TableCell>
                        <TableCell>{clickCounts.total}</TableCell>
                        <TableCell>
                          {clickCounts.rsCount > 0 ? (
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                              Total: {clickCounts.rsCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Total: 0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {clickCounts.blogCount > 0 ? (
                            <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                              Total: {clickCounts.blogCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Total: 0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()} {new Date(session.created_at).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                      {isExpanded && details && (
                        <TableRow>
                          <TableCell colSpan={11} className="bg-muted/30 p-6">
                            <div className="space-y-6">
                              {/* Related Search Clicks */}
                              {details.relatedSearchClicks && details.relatedSearchClicks.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ChevronDown className="h-4 w-4 text-green-600" />
                                    <h4 className="font-semibold text-green-600">View breakdown</h4>
                                  </div>
                                  <div className="grid gap-2 ml-6">
                                    {Array.from(new Set(details.relatedSearchClicks.map((c: any) => c.related_search_id))).map((searchId: any) => {
                                      const searchClick = details.relatedSearchClicks.find((c: any) => c.related_search_id === searchId);
                                      const totalClicks = details.relatedSearchClicks.filter((c: any) => c.related_search_id === searchId).length;
                                      const uniqueClicks = 1; // Each session is unique
                                      return (
                                        <div key={searchId} className="flex items-center gap-3 text-sm">
                                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                            Total: {totalClicks}
                                          </Badge>
                                          <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">
                                            Unique: {uniqueClicks}
                                          </Badge>
                                          <span className="font-medium">
                                            {searchClick?.related_searches?.search_text || 'Unknown Search'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Blog Clicks */}
                              {details.blogClicks && details.blogClicks.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ChevronDown className="h-4 w-4 text-orange-600" />
                                    <h4 className="font-semibold text-orange-600">View breakdown</h4>
                                  </div>
                                  <div className="grid gap-2 ml-6">
                                    {Array.from(new Set(details.blogClicks.map((c: any) => c.blog_id))).map((blogId: any) => {
                                      const blogClick = details.blogClicks.find((c: any) => c.blog_id === blogId);
                                      const totalClicks = details.blogClicks.filter((c: any) => c.blog_id === blogId).length;
                                      const uniqueClicks = 1; // Each session is unique
                                      return (
                                        <div key={blogId} className="flex items-center gap-3 text-sm">
                                          <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                                            Total: {totalClicks}
                                          </Badge>
                                          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                            Unique: {uniqueClicks}
                                          </Badge>
                                          <span className="font-medium">
                                            {blogClick?.blogs?.title || 'Unknown Blog'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Visit Now Clicks */}
                              {details.visitNowClicks && details.visitNowClicks.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-semibold text-blue-600">Visit Now Clicks</h4>
                                  </div>
                                  <div className="grid gap-2 ml-6">
                                    {details.visitNowClicks.map((click: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm">
                                        <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20">
                                          Click
                                        </Badge>
                                        <span className="font-medium">
                                          {click.related_searches?.search_text || 'Unknown'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!details.relatedSearchClicks?.length && !details.blogClicks?.length && !details.visitNowClicks?.length && (
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

export default AdminAnalytics;
