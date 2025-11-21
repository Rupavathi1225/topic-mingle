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
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";

/**
 * DataOrbitZoneAnalytics — UI updated to match TopicMingle screenshot
 * - Logic updated to fetch nested click tables so Details shows click data
 * - Colors / spacing / structure adjusted
 *
 * Added: fetch prelanding_emails and attach to sessions (session.emails)
 * Display: Collected Emails shown in expanded details
 */

const shortId = (id?: string) => (id ? `${id.slice(0, 12)}...` : "-");

const SessionCard = ({ session, idx }: { session: any; idx: number }) => {
  const [open, setOpen] = useState(false);

  // Prefer explicit click arrays if available (these are attached in fetchSessions)
  const relatedClicksArray =
    session.related_search_clicks ||
    (session.events || []).filter((e: any) => e.event_type === "related_search_click");
  const blogClicksArray = session.blog_clicks || (session.events || []).filter((e: any) => e.event_type === "blog_click");
  const visitNowClicksArray = session.visit_now_clicks || [];

  // Build maps (for display) from whichever source we have
  const relatedMap = new Map<string, { text: string; total: number; uniqueIPs: Set<string> }>();
  const blogMap = new Map<string, { title: string; total: number; uniqueIPs: Set<string> }>();

  relatedClicksArray.forEach((ev: any) => {
    const text = ev.related_searches?.search_text || ev.search_text || "Unknown";
    if (!relatedMap.has(text)) relatedMap.set(text, { text, total: 0, uniqueIPs: new Set() });
    const r = relatedMap.get(text)!;
    r.total++;
    if (ev.ip_address) r.uniqueIPs.add(ev.ip_address);
  });

  blogClicksArray.forEach((ev: any) => {
    const title = ev.blogs?.title ? (ev.blogs.serial_number ? `[${ev.blogs.serial_number}] ${ev.blogs.title}` : ev.blogs.title) : (ev.title || "Unknown");
    if (!blogMap.has(title)) blogMap.set(title, { title, total: 0, uniqueIPs: new Set() });
    const b = blogMap.get(title)!;
    b.total++;
    if (ev.ip_address) b.uniqueIPs.add(ev.ip_address);
  });

  const related = Array.from(relatedMap.values()).map((r) => ({ ...r, unique: r.uniqueIPs.size }));
  const blogs = Array.from(blogMap.values()).map((b) => ({ ...b, unique: b.uniqueIPs.size }));

  const totalClicks =
    session.total_clicks ??
    (related.reduce((s, r) => s + r.total, 0) + blogs.reduce((s, b) => s + b.total, 0) + (visitNowClicksArray?.length || 0));

  // Colors chosen to match TopicMingle screenshot
  const outerCard = "bg-[#4B169E]"; // solid purple session card
  const innerPanel = "bg-[#5b2bd9]/60"; // slightly lighter inner panel effect (semi-transparent)
  const detailsWhite = "bg-white";

  return (
    <div className="rounded-xl">
      {/* Outer purple panel with subtle inner rounded panel (matches screenshot) */}
      <div className={`p-4 rounded-lg shadow-md border border-white/8 ${outerCard}`}>
        {/* inner panel for the top row (slightly inset) */}
        <div className={`rounded-md p-4 border border-white/6 ${innerPanel}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/12 flex items-center justify-center text-white font-semibold">
                {session.device ? session.device[0] : "d"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{shortId(session.session_id)}</div>
                <div className="text-xs text-white/75 truncate">{session.device || "Unknown Device"} • {session.source || "Browser"}</div>
                <div className="text-xs text-white/60 mt-1 truncate">{session.ip_address || "IP unknown"} • {session.city ? `${session.city}, ` : ""}{session.country || "WW"}</div>
              </div>
            </div>

            {/* Right side: Details button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(!open)}
                className="text-xs bg-white/10 text-white px-3 py-1 rounded-md hover:bg-white/16 transition"
                aria-expanded={open}
              >
                {open ? "Hide" : "Details"}
              </button>
            </div>
          </div>

          {/* Metrics row */}
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-white/80">Page Views</div>
              <div className="text-lg font-bold text-white">{session.page_views ?? "-"}</div>
            </div>

            <div>
              <div className="text-sm text-white/80">Unique Pages</div>
              <div className="text-lg font-bold text-white">{(session.events || []).filter((e: any) => e.event_type === "blog_view" && e.blog_id).length}</div>
            </div>

            <div>
              <div className="text-sm text-white/80">Total Clicks</div>
              <div className="text-lg font-bold text-white">{totalClicks}</div>
            </div>

            <div>
              <div className="text-sm text-white/80">Unique Clicks</div>
              <div className="text-lg font-bold text-white">{new Set((session.events || []).filter((e:any) => (e.event_type === "blog_click" && e.blog_id) || (e.event_type === "related_search_click" && e.related_search_id)).map((e:any) => e.blog_id || e.related_search_id)).size}</div>
            </div>
          </div>
        </div>

        {/* Expanded details area (white card inside purple) */}
        {open && (
          <div className="mt-4 p-4 rounded-md border border-white/8" style={{ background: "#4A1AA0" }}>
            <div className="rounded-md p-0 border border-white/8 overflow-hidden">
              <div className={`p-4 ${detailsWhite} rounded`}>
                {/* small search header */}
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-gray-500" />
                  <div className="text-sm font-semibold text-gray-700">Related Search Clicks</div>
                </div>

                {/* Related search list */}
                {related.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {related.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded border">
                        <div className="text-sm text-gray-800">{r.text}</div>
                        <div className="text-xs text-gray-600">Unique: {r.unique} <span className="ml-3 text-indigo-600 font-semibold">Total: {r.total}</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mb-4">No related search clicks</div>
                )}

                {/* Blog Clicks */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Blog Clicks</div>
                  {blogs.length > 0 ? (
                    <div className="space-y-2">
                      {blogs.map((b, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded border">
                          <div className="text-sm text-gray-800">{b.title}</div>
                          <div className="text-xs text-gray-600">Unique: {b.unique} <span className="ml-3 text-rose-500 font-semibold">Total: {b.total}</span></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No blog clicks</div>
                  )}
                </div>

                {/* Visit Now Clicks */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Visit Now Clicks</div>
                  {visitNowClicksArray && visitNowClicksArray.length > 0 ? (
                    visitNowClicksArray.map((v: any, i: number) => (
                      <div key={i} className="p-3 rounded border mb-2 text-sm text-gray-700">
                        <span className="inline-block px-2 py-1 text-xs bg-cyan-50 rounded mr-2">Click</span>
                        {v.related_searches?.search_text || v.search_text || "Unknown"}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No visit now clicks</div>
                  )}
                </div>

                {/* Collected Emails (NEW) */}
                <div className="mt-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Collected Emails</div>
                  {session.emails && session.emails.length > 0 ? (
                    <div className="space-y-2">
                      {session.emails.map((e: any) => (
                        <div key={e.id} className="p-3 rounded border bg-gray-50 text-sm flex items-center justify-between">
                          <div>
                            <div className="font-medium">{e.email}</div>
                            <div className="text-xs text-gray-500">{e.related_searches?.search_text || e.related_search_id || ""}</div>
                          </div>
                          <div className="text-xs text-gray-500">{format(new Date(e.created_at), "MMM dd, yyyy HH:mm")}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No emails collected</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryFilter, sourceFilter]);

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
      // fetch raw events (existing approach) — keeps compatibility with your existing logic
      const { data } = await dataOrbitZoneClient
        .from("analytics")
        .select(`
          *,
          blogs(title, serial_number),
          related_searches(search_text)
        `)
        .order("created_at", { ascending: false });

      const events = data || [];

      // fetch click tables and map by session_id so details panel can show them
      const [{ data: blogClicks }, { data: rsClicks }, { data: vnClicks }, { data: emails }] = await Promise.all([
        dataOrbitZoneClient.from("blog_clicks").select("*, blogs(title, serial_number)"),
        dataOrbitZoneClient.from("related_search_clicks").select("*, related_searches(search_text)"),
        dataOrbitZoneClient.from("visit_now_clicks").select("*, related_searches(search_text)"),
        // fetch prelanding emails and include related_searches search_text so we can show it in UI
        dataOrbitZoneClient.from("prelanding_emails").select("*, related_searches(search_text)").order("created_at", { ascending: false }),
      ]);

      const blogClicksBySession = new Map<string, any[]>();
      (blogClicks || []).forEach((c: any) => {
        const sid = c.session_id || c.session?.session_id || c.sessionId || c.sessionId;
        if (!sid) return;
        if (!blogClicksBySession.has(sid)) blogClicksBySession.set(sid, []);
        blogClicksBySession.get(sid).push(c);
      });

      const rsClicksBySession = new Map<string, any[]>();
      (rsClicks || []).forEach((c: any) => {
        const sid = c.session_id || c.session?.session_id || c.sessionId;
        if (!sid) return;
        if (!rsClicksBySession.has(sid)) rsClicksBySession.set(sid, []);
        rsClicksBySession.get(sid).push(c);
      });

      const vnClicksBySession = new Map<string, any[]>();
      (vnClicks || []).forEach((c: any) => {
        const sid = c.session_id || c.session?.session_id || c.sessionId;
        if (!sid) return;
        if (!vnClicksBySession.has(sid)) vnClicksBySession.set(sid, []);
        vnClicksBySession.get(sid).push(c);
      });

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
            // we'll attach click arrays below
            blog_clicks: [],
            related_search_clicks: [],
            visit_now_clicks: [],
            emails: [], // will be filled below
          });
        }

        const session = sessionMap.get(event.session_id);

        if (event.event_type === "blog_view") session.page_views++;
        if (event.event_type === "blog_click" || event.event_type === "related_search_click") session.total_clicks++;

        session.events.push(event);

        if (new Date(event.created_at) > new Date(session.last_active)) {
          session.last_active = event.created_at;
        }
      });

      // Attach click arrays to sessions (so SessionCard can read them)
      for (const [sid, sess] of sessionMap.entries()) {
        sess.blog_clicks = blogClicksBySession.get(sid) || [];
        sess.related_search_clicks = rsClicksBySession.get(sid) || [];
        sess.visit_now_clicks = vnClicksBySession.get(sid) || [];
        // Optionally merge click rows into events so previous logic still works
        sess.events = (sess.events || []).concat(sess.blog_clicks || [], sess.related_search_clicks || [], sess.visit_now_clicks || []);
      }

      // Attach emails to sessions:
      // emails.data is the array returned (we named the promise result 'emails')
      const emailsArray = emails || [];
      for (const [sid, sess] of sessionMap.entries()) {
        // session may have related_search_clicks with related_search_id, or events that contain related_search_id
        const relatedIds = new Set<string>();
        (sess.related_search_clicks || []).forEach((rc: any) => {
          if (rc.related_search_id) relatedIds.add(rc.related_search_id);
        });
        // also include any related_search_id from merged events (some rows may be direct)
        (sess.events || []).forEach((ev: any) => {
          if (ev.related_search_id) relatedIds.add(ev.related_search_id);
        });

        // find emails where related_search_id matches any of the relatedIds
        sess.emails = (emailsArray || []).filter((em: any) => em.related_search_id && relatedIds.has(em.related_search_id));
      }

      setSessions(Array.from(sessionMap.values()));
    } catch (err) {
      console.error("fetch sessions error", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Summary stats
  const totalSessions = sessions.length;
  const totalPageViews = sessions.reduce((s, sess) => s + (sess.page_views ?? 0), 0);
  const totalClicks = sessions.reduce((s, sess) => s + (sess.total_clicks ?? 0), 0);
  const uniqueVisitors = new Set(sessions.map((s) => s.ip_address)).size;

  const uniqueClicks = new Set(
    sessions.flatMap((sess) =>
      (sess.events || [])
        .filter((e: any) =>
          (e.event_type === "related_search_click" && e.related_search_id) ||
          (e.event_type === "blog_click" && e.blog_id) ||
          // sometimes click rows from click tables don't have event_type; include blog_clicks/related_search_clicks ids
          e.blog_id || e.related_search_id || e.id
        )
        .map((e: any) => e.related_search_id || e.blog_id || e.id)
    )
  ).size;

  return (
    <div className="min-h-screen pb-12" style={{ background: "linear-gradient(180deg,#4b169e,#3d0d99)" }}>
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* Header Tabs (kept simple) */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Panel - DataOrbitZone</h1>
        </div>

        {/* Main purple container */}
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg,#5b2bd9,#4b169e)" }}>
          <div className="p-6">
            {/* Top summary card (white) */}
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="w-full max-w-xs">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">D</div>
                    <div>
                      <div className="text-lg font-semibold">DataOrbitZone</div>
                      <div className="text-xs text-muted-foreground">{totalSessions} sessions</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Page Views</div>
                      <div className="text-2xl font-bold text-gray-900"> {totalPageViews} </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Unique Visitors</div>
                      <div className="text-2xl font-bold text-gray-900"> {uniqueVisitors} </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Total Clicks</div>
                      <div className="text-2xl font-bold text-rose-500"> {totalClicks} </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Unique Clicks</div>
                      <div className="text-2xl font-bold text-violet-600"> {uniqueClicks} </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex-1 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-36 bg-white">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Worldwide</SelectItem>
                      {filterOptions.countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-36 bg-white">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filterOptions.sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={() => { setCountryFilter("all"); setSourceFilter("all"); }}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Sessions list */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-10 text-white">Loading...</div>
              ) : sessions.length === 0 ? (
                <Card>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-gray-100">No sessions yet.</p>
                  </CardContent>
                </Card>
              ) : (
                sessions.map((session, i) => <div key={session.session_id || i} className="mb-4"><SessionCard session={session} idx={i} /></div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
