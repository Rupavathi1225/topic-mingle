import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 20).map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-xs">{session.session_id.substring(0, 20)}...</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{session.ip_address}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{session.country}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{session.source}</Badge>
                  </TableCell>
                  <TableCell>{session.device}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(session.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
