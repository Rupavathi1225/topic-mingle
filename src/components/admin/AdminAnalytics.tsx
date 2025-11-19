import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Card-based AdminAnalytics component
 *
 * - Card layout for each session (full-width stacked cards)
 * - Gradient backgrounds based on source / click count
 * - Expand/collapse per card to show click breakdown
 * - Reuses your Supabase queries and detail fetching logic
 */

const gradientBySource = (source: string | null, totalClicks: number) => {
  // Return tailwind classes for gradient color depending on source/clicks
  if (source === "meta") return "bg-gradient-to-r from-cyan-500 to-blue-600";
  if (source === "linkedin") return "bg-gradient-to-r from-purple-500 to-pink-600";
  if (totalClicks >= 5) return "bg-gradient-to-r from-rose-500 to-orange-500";
  return "bg-gradient-to-r from-teal-400 to-cyan-600";
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryFilter, sourceFilter]);

  const fetchAnalytics = async () => {
    try {
      let sessionQuery: any = supabase.from('analytics_sessions').select('*').order('created_at', { ascending: false });

      if (countryFilter) {
        sessionQuery = sessionQuery.eq('country', countryFilter);
      }
      if (sourceFilter) {
        sessionQuery = sessionQuery.eq('source', sourceFilter);
      }

      const { data: sessionsData } = await sessionQuery;
      if (sessionsData) setSessions(sessionsData);

      // other counts / click tables
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
    } catch (err) {
      console.error("fetchAnalytics error:", err);
    }
  };

  const toggleSessionExpand = async (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
      setExpandedSessions(newExpanded);
      return;
    }
    newExpanded.add(sessionId);
    setExpandedSessions(newExpanded);

    // fetch details if not loaded
    if (!sessionDetails[sessionId]) {
      try {
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
      } catch (err) {
        console.error("fetch session details error:", err);
      }
    }
  };

  // helper to compute counts quickly for card header
  const getSessionCounts = (sessionId: string) => {
    const rsCount = relatedSearchClicks.filter(c => c.session_id === sessionId).length;
    const blogCount = blogClicks.filter(c => c.session_id === sessionId).length;
    const vnCount = visitNowClicks.filter(c => c.session_id === sessionId).length;
    return { rsCount, blogCount, vnCount, total: rsCount + blogCount + vnCount };
  };

  // UI helpers
  const shortId = (id?: string) => (id ? `${id.substring(0, 12)}...` : "-");

  return (
    <div className="space-y-6 px-4 md:px-8">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Top Stats */}
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

      {/* Sessions - Card View */}
      <div className="space-y-4">
        {sessions.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            </CardContent>
          </Card>
        )}

        {sessions.map((session) => {
          const sid = session.session_id || session.id || Math.random().toString(36).slice(2, 9);
          const counts = getSessionCounts(sid);
          const isExpanded = expandedSessions.has(sid);
          const details = sessionDetails[sid];

          const gradient = gradientBySource(session.source || "direct", counts.total);

          return (
            <div
              key={sid}
              className={`rounded-lg shadow-sm overflow-hidden border-2 ${isExpanded ? "ring-2 ring-indigo-300" : "border-transparent"}`}
            >
              {/* Header part of the card */}
              <div className={`${gradient} p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6`}>
                <div className="flex items-start gap-3 md:flex-1">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-mono text-sm">
                    {session.device ? session.device[0] : "S"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {session.device || "Unknown Device"} • {session.browser || "Browser"}
                    </div>
                    <div className="text-xs text-white/90 mt-1">
                      <span className="font-mono">{shortId(sid)}</span> — {session.ip_address || "IP unknown"} • {session.city ? `${session.city}, ` : ""}{session.country || "WW"}
                    </div>
                    <div className="text-xs text-white/80 mt-1">
                      {new Date(session.created_at).toLocaleDateString()} {new Date(session.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Stats badges */}
                <div className="flex gap-3 md:items-center md:justify-end">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{session.page_views ?? "-"}</div>
                    <div className="text-xs text-white/90">Page Views</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{counts.total}</div>
                    <div className="text-xs text-white/90">Total Clicks</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{counts.blogCount}</div>
                    <div className="text-xs text-white/90">Blog Clicks</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{counts.rsCount}</div>
                    <div className="text-xs text-white/90">Search Clicks</div>
                  </div>

                  <button
                    onClick={() => toggleSessionExpand(sid)}
                    className="ml-2 inline-flex items-center rounded-md bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30 transition"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    <span>{isExpanded ? "Hide" : "Details"}</span>
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="bg-white/5 p-5 md:p-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Related Search Clicks */}
                    <div className="rounded-md bg-white/3 p-3">
                      <h4 className="text-sm font-semibold mb-2">Related Search Clicks</h4>
                      {details?.relatedSearchClicks?.length > 0 ? (
                        Array.from(new Set(details.relatedSearchClicks.map((c: any) => c.related_search_id))).map((rid: any) => {
                          const clicksFor = details.relatedSearchClicks.filter((c: any) => c.related_search_id === rid);
                          const sample = clicksFor[0];
                          return (
                            <div key={rid} className="flex items-center gap-3 mb-2">
                              <Badge className="bg-green-500/10 text-green-600">Total: {clicksFor.length}</Badge>
                              <Badge className="bg-purple-500/10 text-purple-600">Unique: 1</Badge>
                              <div className="text-sm font-medium">{sample?.related_searches?.search_text || "Unknown search"}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-muted-foreground">No related search clicks</div>
                      )}
                    </div>

                    {/* Blog Clicks */}
                    <div className="rounded-md bg-white/3 p-3">
                      <h4 className="text-sm font-semibold mb-2">Blog Clicks</h4>
                      {details?.blogClicks?.length > 0 ? (
                        Array.from(new Set(details.blogClicks.map((c: any) => c.blog_id))).map((bid: any) => {
                          const clicksFor = details.blogClicks.filter((c: any) => c.blog_id === bid);
                          const sample = clicksFor[0];
                          return (
                            <div key={bid} className="flex items-center gap-3 mb-2">
                              <Badge className="bg-orange-500/10 text-orange-600">Total: {clicksFor.length}</Badge>
                              <Badge className="bg-blue-500/10 text-blue-600">Unique: 1</Badge>
                              <div className="text-sm font-medium">{sample?.blogs?.title || "Unknown blog"}</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-muted-foreground">No blog clicks</div>
                      )}
                    </div>

                    {/* Visit Now */}
                    <div className="rounded-md bg-white/3 p-3">
                      <h4 className="text-sm font-semibold mb-2">Visit Now Clicks</h4>
                      {details?.visitNowClicks?.length > 0 ? (
                        details.visitNowClicks.map((c: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 mb-2">
                            <Badge className="bg-cyan-500/10 text-cyan-600">Click</Badge>
                            <div className="text-sm font-medium">{c.related_searches?.search_text || "Unknown"}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No visit now clicks</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Keep Blog & Related Search tables below unchanged (if you want them removed or restyled, tell me) */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* small summary table (simple) */}
          <div className="grid gap-2">
            {Object.values(blogClicks || {}).length === 0 ? (
              <div className="text-sm text-muted-foreground">No blog clicks yet</div>
            ) : (
              Object.values(blogClicks).map((b: any, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white/3 rounded">
                  <div className="font-medium">{b.blogs?.title || "Unknown"}</div>
                  <Badge>{b.id ? 1 : 0}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
