import { useEffect, useState } from "react";
import { dataOrbitZoneClient } from "@/integrations/dataorbitzone/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";

/**
 * Redesigned DataOrbitZoneAnalytics
 * - Card-based session UI (stacked)
 * - Summary metric tiles
 * - Filters preserved
 * - Expandable session details with Related Searches & Blog Clicks
 * - Reuses your dataOrbitZoneClient queries and aggregation logic
 */

const gradientByIndex = (i: number) => {
  const palettes = [
    "from-orange-400 to-orange-600",
    "from-blue-400 to-blue-600",
    "from-purple-500 to-violet-600",
    "from-emerald-400 to-teal-600",
    "from-pink-400 to-rose-600",
  ];
  return palettes[i % palettes.length];
};

const shortId = (id?: string) => (id ? `${id.slice(0, 11)}...` : "-");

const SessionCard = ({ session, idx }: { session: any; idx: number }) => {
  const [open, setOpen] = useState(false);

  // build related searches summary
  const relatedMap = new Map<string, { text: string; total: number; uniqueIPs: Set<string> }>();
  const blogMap = new Map<string, { title: string; total: number; uniqueIPs: Set<string> }>();

  (session.events || []).forEach((ev: any) => {
    if (ev.event_type === "related_search_click" && ev.related_searches) {
      const key = ev.related_searches.search_text || "Unknown";
      if (!relatedMap.has(key)) relatedMap.set(key, { text: key, total: 0, uniqueIPs: new Set() });
      const r = relatedMap.get(key)!;
      r.total++;
      if (ev.ip_address) r.uniqueIPs.add(ev.ip_address);
    }
    if (ev.event_type === "blog_click" && ev.blogs) {
      const title = ev.blogs.serial_number ? `[${ev.blogs.serial_number}] ${ev.blogs.title}` : ev.blogs.title || "Unknown";
      if (!blogMap.has(title)) blogMap.set(title, { title, total: 0, uniqueIPs: new Set() });
      const b = blogMap.get(title)!;
      b.total++;
      if (ev.ip_address) b.uniqueIPs.add(ev.ip_address);
    }
  });

  const related = Array.from(relatedMap.values()).map((r) => ({ ...r, unique: r.uniqueIPs.size }));
  const blogs = Array.from(blogMap.values()).map((b) => ({ ...b, unique: b.uniqueIPs.size }));

  const totalClicks = session.total_clicks ?? (related.reduce((s, r) => s + r.total, 0) + blogs.reduce((s, b) => s + b.total, 0));

  const gradient = gradientByIndex(idx);

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border">
      <div className={`p-4 md:p-6 bg-gradient-to-r ${gradient} text-white flex flex-col md:flex-row md:items-center gap-4`}>
        <div className="flex items-center gap-3 md:flex-1">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
            {session.device ? session.device[0] : "S"}
          </div>
          <div>
            <div className="text-sm font-semibold">{session.device || "Unknown Device"} • {session.source || "direct"}</div>
            <div className="text-xs opacity-90 mt-1">
              <span className="font-mono">{shortId(session.session_id)}</span> — {session.ip_address || "IP N/A"} • {session.country || "WW"}
            </div>
            <div className="text-xs opacity-80 mt-1">{session.city ? `${session.city}, ` : ""}{session.country || ""}</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{session.page_views ?? 0}</div>
            <div className="text-xs opacity-90">Page Views</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{totalClicks}</div>
            <div className="text-xs opacity-90">Total Clicks</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{blogs.reduce((s, b) => s + b.total, 0)}</div>
            <div className="text-xs opacity-90">Blog Clicks</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{related.reduce((s, r) => s + r.total, 0)}</div>
            <div className="text-xs opacity-90">Search Clicks</div>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-white/20 px-3 py-1 text-sm hover:bg-white/30 transition"
            aria-expanded={open}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="text-white text-sm">{open ? "Hide" : "Details"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-white p-5 md:p-6 border-t">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-3">Related Searches</h4>
              {related.length > 0 ? (
                <div className="space-y-2">
                  {related.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-50 border rounded">
                      <div className="font-medium text-sm">{r.text}</div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <div className="px-2 py-1 bg-blue-50 rounded">Total: {r.total}</div>
                        <div className="px-2 py-1 bg-purple-50 rounded">Unique: {r.unique}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No related searches</div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3">Blog Clicks</h4>
              {blogs.length > 0 ? (
                <div className="space-y-2">
                  {blogs.map((b, i) => (
                    <div key={i} className="p-3 bg-gray-50 border rounded">
                      <div className="font-medium text-sm">{b.title}</div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <div className="px-2 py-1 bg-amber-50 rounded">Total: {b.total}</div>
                        <div className="px-2 py-1 bg-indigo-50 rounded">Unique: {b.unique}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No blog clicks</div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3">Session Info</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div>IP: <span className="font-mono">{session.ip_address || "N/A"}</span></div>
                <div>Last Active: {session.last_active ? format(new Date(session.last_active), "M/d/yyyy, h:mm:ss a") : "-"}</div>
                <div>Source: {session.source || "direct"}</div>
                <div>Device: {session.device || "Unknown"}</div>
                <div>Events: {(session.events || []).length}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DataOrbitZoneAnalytics() {
  const [countryFilter, setCountryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sessions, setSessions] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ countries: string[]; sources: string[] }>({ countries: [], sources: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
    // fetchSessions depends on filters
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryFilter, sourceFilter]);

  // Fetch dropdown options
  const fetchFilterOptions = async () => {
    try {
      const { data } = await dataOrbitZoneClient.from("analytics").select("country, source");
      const countries = Array.from(new Set((data || []).map((d: any) => d.country).filter(Boolean)));
      const sources = Array.from(new Set((data || []).map((d: any) => d.source).filter(Boolean)));
      setFilterOptions({ countries, sources });
    } catch (err) {
      console.error("fetch filter options error", err);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let query = dataOrbitZoneClient
        .from("analytics")
        .select(`
          *,
          blogs(title, serial_number),
          related_searches(search_text)
        `)
        .order("created_at", { ascending: false });

      const { data } = await query;
      const events = data || [];

      // Client-side filters
      const filtered = events.filter((e: any) => {
        if (countryFilter !== "all" && e.country !== countryFilter) return false;
        if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
        return true;
      });

      const sessionMap = new Map<string, any>();

      filtered.forEach((event: any) => {
        if (!sessionMap.has(event.session_id)) {
          sessionMap.set(event.session_id, {
            session_id: event.session_id,
            ip_address: event.ip_address,
            country: event.country,
            source: event.source,
            device: event.device,
            last_active: event.created_at,
            page_views: 0,
            total_clicks: 0,
            events: [],
          });
        }

        const session = sessionMap.get(event.session_id);

        if (event.event_type === "blog_view") {
          session.page_views++;
        }

        if (event.event_type === "blog_click" || event.event_type === "related_search_click") {
          session.total_clicks++;
        }

        session.events.push(event);

        if (new Date(event.created_at) > new Date(session.last_active)) {
          session.last_active = event.created_at;
        }
      });

      setSessions(Array.from(sessionMap.values()));
    } catch (err) {
      console.error("fetch sessions error", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Summary Stats
  const totalSessions = sessions.length;
  const totalPageViews = sessions.reduce((s, sess) => s + (sess.page_views ?? 0), 0);
  const totalClicks = sessions.reduce((s, sess) => s + (sess.total_clicks ?? 0), 0);
  const uniqueVisitors = new Set(sessions.map((s) => s.ip_address)).size;

  // Unique Clicks (blog_id or related_search_id)
  const uniqueClicks = new Set(
    sessions.flatMap((sess) =>
      (sess.events || [])
        .filter((e: any) =>
          (e.event_type === "related_search_click" && e.related_search_id) ||
          (e.event_type === "blog_click" && e.blog_id)
        )
        .map((e: any) => e.related_search_id || e.blog_id)
    )
  ).size;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel - DramaOrbitZone (Multi-site)</h1>

        {/* Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-5 bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-sm">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{totalSessions}</div>
              <div className="text-sm text-gray-600">Unique visitors: {uniqueVisitors}</div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalPageViews}</div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm">Unique Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {
                  new Set(
                    sessions.flatMap((s) =>
                      (s.events || []).filter((e: any) => e.event_type === "blog_view" && e.blog_id).map((e: any) => e.blog_id)
                    )
                  ).size
                }
              </div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalClicks}</div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-pink-50 border-pink-200">
            <CardHeader>
              <CardTitle className="text-sm">Unique Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{uniqueClicks}</div>
              <div className="text-sm text-gray-600">Unique Blog + Search Clicks</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Country</label>
                <Select value={countryFilter} onValueChange={(v) => setCountryFilter(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Source</label>
                <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.sources.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => { setCountryFilter("all"); setSourceFilter("all"); }}>Reset</Button>
              <Button onClick={() => fetchSessions()} variant="secondary">Refresh</Button>
            </div>
          </div>
        </Card>

        {/* Sessions list (card view) */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center text-gray-500 py-6">No analytics data</div>
              </CardContent>
            </Card>
          ) : (
            sessions.map((s, i) => <SessionCard key={s.session_id || i} session={s} idx={i} />)
          )}
        </div>
      </div>
    </div>
  );
}
