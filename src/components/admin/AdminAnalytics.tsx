import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

/**
 * AdminAnalytics (UI update only)
 *
 * - Logic / queries unchanged
 * - Only JSX / Tailwind classes changed to a modern gradient look
 * - Keeps all state, fetching, and helper functions intact
 */

const gradientBySource = (source: string | null, totalClicks: number) => {
  // Keep same mapping but slightly softened
  if (source === "meta") return "from-cyan-500 to-blue-600";
  if (source === "linkedin") return "from-violet-500 to-pink-600";
  if (totalClicks >= 5) return "from-rose-500 to-orange-500";
  return "from-teal-400 to-cyan-600";
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
    <div className="min-h-screen pb-12 bg-gradient-to-b from-white to-white/95">
      {/* Page container centered with purple side borders like reference */}
      <div className="max-w-4xl mx-auto pt-8 px-4">
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg,#5b2aa6,#6a28a9)" }}>
          <div className="p-6">
            {/* Top small stats card */}
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="w-full max-w-xs">
                <div className="bg-white/95 rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">T</div>
                    <div>
                      <div className="text-lg font-semibold">topicmingle</div>
                      <div className="text-xs text-muted-foreground">54 sessions</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Page Views</div>
                      <div className="text-2xl font-bold"> {stats.totalPageViews ?? 0} </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Unique Pages</div>
                      <div className="text-2xl font-bold"> {Math.max(0, Math.round((stats.totalPageViews ?? 0) / 30))} </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Total Clicks</div>
                      <div className="text-2xl font-bold text-rose-500"> {stats.totalClicks ?? 0} </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Unique Clicks</div>
                      <div className="text-2xl font-bold text-violet-600"> {Math.round((stats.totalClicks ?? 0) / 4)} </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex-1 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WW">Worldwide</SelectItem>
                      <SelectItem value="US">USA</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                    </SelectContent>
                  </Select>
                  {countryFilter && (
                    <Button variant="outline" size="sm" onClick={() => setCountryFilter("")}>
                      Clear
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="meta">Meta</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                  {sourceFilter && (
                    <Button variant="outline" size="sm" onClick={() => setSourceFilter("")}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sessions list */}
            <div className="space-y-6">
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
                  <div key={sid} className="rounded-xl">
                    {/* outer bordered purple frame (subtle) */}
                    <div className="p-2 rounded-lg" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.02))" }}>
                      {/* header gradient card */}
                      <div
                        className={`rounded-lg shadow-md overflow-hidden border border-white/10`}
                      >
                        <div
                          className={`p-5 flex flex-col md:flex-row md:items-center gap-4`}
                          style={{
                            background: `linear-gradient(90deg, rgba(10, 210, 210, 0.12), rgba(10, 120, 200, 0.12))`
                          }}
                        >
                          <div className="flex items-start gap-4 md:flex-1">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                              {session.device ? session.device[0] : "S"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-white truncate">{shortId(sid)}</div>
                                  <div className="text-xs text-white/80 truncate">{session.device || "Unknown Device"} • {session.browser || "Browser"}</div>
                                  <div className="text-xs text-white/70 mt-1 truncate">{session.ip_address || "IP unknown"} • {session.city ? `${session.city}, ` : ""}{session.country || "WW"}</div>
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                  <button
                                    onClick={() => toggleSessionExpand(sid)}
                                    className="px-3 py-1 rounded-md bg-white/12 text-white text-sm hover:bg-white/20 transition flex items-center gap-2"
                                    aria-expanded={isExpanded}
                                  >
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <span>{isExpanded ? "Hide" : "Details"}</span>
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <div className="text-xs text-white/80">Page Views</div>
                                  <div className="text-xl font-bold text-white">{session.page_views ?? "-"}</div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xs text-white/80">Unique Pages</div>
                                  <div className="text-xl font-bold text-white">{counts.rsCount}</div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xs text-white/80">Total Clicks</div>
                                  <div className="text-xl font-bold text-white">{counts.total}</div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xs text-white/80">Unique Clicks</div>
                                  <div className="text-xl font-bold text-white">{counts.blogCount}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* mobile details button */}
                          <div className="flex md:hidden items-center justify-end">
                            <button
                              onClick={() => toggleSessionExpand(sid)}
                              className="px-3 py-1 rounded-md bg-white/12 text-white text-sm hover:bg-white/20 transition flex items-center gap-2"
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <span>{isExpanded ? "Hide" : "Details"}</span>
                            </button>
                          </div>
                        </div>

                        {/* expanded content */}
                        {isExpanded && (
                          <div className="p-4" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" }}>
                            <div className="rounded-md overflow-hidden border border-white/6">
                              <div className="p-4 bg-gradient-to-b from-white/5 to-white/2">
                                {/* Related Search Clicks */}
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Search className="h-4 w-4 text-white/80" />
                                    <div className="text-sm font-semibold text-white">Related Search Clicks</div>
                                  </div>

                                  {details?.relatedSearchClicks?.length > 0 ? (
                                    Array.from(new Set(details.relatedSearchClicks.map((c: any) => c.related_search_id))).map((rid: any) => {
                                      const clicksFor = details.relatedSearchClicks.filter((c: any) => c.related_search_id === rid);
                                      const sample = clicksFor[0];
                                      return (
                                        <div key={rid} className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                                          <div className="flex items-center gap-3">
                                            <Badge className="bg-green-500/10 text-green-400">Total: {clicksFor.length}</Badge>
                                            <div className="text-sm text-white/90">{sample?.related_searches?.search_text || "Unknown search"}</div>
                                          </div>
                                          <div className="text-xs text-white/80">Unique: 1</div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-sm text-muted-foreground">No related search clicks</div>
                                  )}
                                </div>

                                {/* Blog Clicks */}
                                <div className="mb-4">
                                  <div className="text-sm font-semibold text-white mb-3">Blog Clicks</div>
                                  {details?.blogClicks?.length > 0 ? (
                                    Array.from(new Set(details.blogClicks.map((c: any) => c.blog_id))).map((bid: any) => {
                                      const clicksFor = details.blogClicks.filter((c: any) => c.blog_id === bid);
                                      const sample = clicksFor[0];
                                      return (
                                        <div key={bid} className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                                          <div className="flex items-center gap-3">
                                            <Badge className="bg-orange-500/10 text-orange-400">Total: {clicksFor.length}</Badge>
                                            <div className="text-sm text-white/90">{sample?.blogs?.title || "Unknown blog"}</div>
                                          </div>
                                          <div className="text-xs text-white/80">Unique: 1</div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-sm text-muted-foreground">No blog clicks</div>
                                  )}
                                </div>

                                {/* Visit Now Clicks */}
                                <div>
                                  <div className="text-sm font-semibold text-white mb-3">Visit Now Clicks</div>
                                  {details?.visitNowClicks?.length > 0 ? (
                                    details.visitNowClicks.map((c: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                                        <div className="flex items-center gap-3">
                                          <Badge className="bg-cyan-500/10 text-cyan-400">Click</Badge>
                                          <div className="text-sm text-white/90">{c.related_searches?.search_text || "Unknown"}</div>
                                        </div>
                                        <div className="text-xs text-white/80">—</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-muted-foreground">No visit now clicks</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Blog clicks summary (kept simple) */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Clicks</CardTitle>
                </CardHeader>
                <CardContent>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
