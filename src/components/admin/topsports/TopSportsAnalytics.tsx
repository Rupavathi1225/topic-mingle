"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { topsportsClient } from "@/integrations/topsports/client";
import { Loader2 } from "lucide-react";

const AUTO_REFRESH_MS = 5000;
const PURPLE_TOP = "#5B2FBF";
const PURPLE_BOTTOM = "#35145a";
const SESSION_BOX_BG = "rgba(255,255,255,0.04)";
const AVATAR_BG = "rgba(255,255,255,0.06)";

export default function TopsportsAnalytics() {
  const [openSession, setOpenSession] = useState<string | null>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["topsports-sessions"],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: AUTO_REFRESH_MS,
  });

  const { data: clicks, isLoading: clicksLoading } = useQuery({
    queryKey: ["topsports-clicks"],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from("clicks")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: AUTO_REFRESH_MS,
  });

  if (sessionsLoading || clicksLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
      </div>
    );
  }

  const isPageView = (c: any) =>
    c.item_type === "page_view" || c.item_type === "page" || c.item_type === "view";
  const isCategory = (c: any) => c.item_type === "category" || c.item_type === "web_result";
  const isRelatedSearch = (c: any) =>
    c.item_type === "related_search" || c.item_type === "search" || c.item_type === "related";
  const isBlogClick = (c: any) =>
    c.item_type === "blog" ||
    c.item_type === "blog_click" ||
    (c.item_title || "").toLowerCase().includes("blog");
  const isPrelanding = (c: any) => c.item_type === "prelanding" || c.item_type === "prelanding_submit";
  const isEmailCapture = (c: any) =>
    c.item_type === "email" ||
    c.item_type === "email_capture" ||
    (c.item_type || "").toLowerCase().includes("email");

  const totalSessions = sessions?.length || 0;
  const totalClicks = (clicks || []).filter((c: any) => !isPageView(c)).length;
  const totalPageViews = (clicks || []).filter((c: any) => isPageView(c)).length;
  const totalCategoryClicks = (clicks || []).filter((c: any) => isCategory(c)).length;
  const totalRelatedSearch = (clicks || []).filter((c: any) => isRelatedSearch(c)).length;
  const totalBlogClicks = (clicks || []).filter((c: any) => isBlogClick(c)).length;
  const totalPrelanding = (clicks || []).filter((c: any) => isPrelanding(c)).length;
  const totalEmailCaptures = (clicks || []).filter((c: any) => isEmailCapture(c)).length;

  const sessionsWithMeta = useMemo(() => {
    const clicksBySession: Record<string, any[]> = {};
    (clicks || []).forEach((c: any) => {
      const sid = c.session_id || "unknown";
      if (!clicksBySession[sid]) clicksBySession[sid] = [];
      clicksBySession[sid].push(c);
    });

    return (sessions || []).map((s: any) => {
      const sid = s.session_id || s.id || "";
      const sclicks = clicksBySession[sid] || [];

      const pageViews = sclicks.filter((c) => isPageView(c)).length;
      const totalClicksForSession = sclicks.filter((c) => !isPageView(c)).length;
      const blogClicks = sclicks.filter((c) => isBlogClick(c)).length;
      const searchClicks = sclicks.filter((c) => isRelatedSearch(c)).length;
      const prelandingClicks = sclicks.filter((c) => isPrelanding(c)).length;
      const emailCaptures = sclicks.filter((c) => isEmailCapture(c)).length;

      const uniquePages = new Set(sclicks.map((c) => (c.page || "").toString())).size;
      const uniqueClicks = new Set(sclicks.map((c) => `${c.session_id}::${(c.item_id || "").toString()}`)).size;
      const eventsCount = sclicks.length;

      const relatedMap: Record<string, { query: string; total: number; uniqueSessions: Set<string> }> = {};
      sclicks.filter((c) => isRelatedSearch(c)).forEach((r: any) => {
        const key = r.item_title || r.item_id || r.page || "unknown";
        if (!relatedMap[key]) relatedMap[key] = { query: key, total: 0, uniqueSessions: new Set() };
        relatedMap[key].total += 1;
        relatedMap[key].uniqueSessions.add(sid);
      });

      const related_searches = Object.values(relatedMap).map((v) => ({
        query: v.query,
        total: v.total,
        unique: v.uniqueSessions.size,
      }));

      let lastActive = s.last_active;
      if (!lastActive) {
        if (sclicks.length) lastActive = sclicks[0].timestamp;
        else lastActive = s.created_at;
      }

      return {
        ...s,
        page_views: pageViews,
        total_clicks: totalClicksForSession,
        blog_clicks: blogClicks,
        search_clicks: searchClicks,
        prelanding_clicks: prelandingClicks,
        email_captures: emailCaptures,
        unique_pages: uniquePages,
        unique_clicks: uniqueClicks,
        events_count: eventsCount,
        related_searches,
        last_active: lastActive,
      };
    });
  }, [sessions, clicks]);

  const fmt = (ts: any) => {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  };

  const sumUniquePages = sessionsWithMeta.reduce((a: number, b: any) => a + (b.unique_pages || 0), 0);
  const sumUniqueClicks = sessionsWithMeta.reduce((a: number, b: any) => a + (b.unique_clicks || 0), 0);

  return (
    <div className="flex justify-center py-10">
      <div className="w-full max-w-3xl">
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(180deg, ${PURPLE_TOP}, ${PURPLE_BOTTOM})`,
            padding: "24px",
          }}
        >
          <div className="flex gap-6 items-start mb-6">
            <div className="bg-white rounded-xl p-4 w-2/3 shadow-inner" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-3">
                <img
                  src="/mnt/data/3352c6de-a298-4412-afa2-6ea4f9f00ef2.png"
                  alt="topsports"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div>
                  <div className="font-semibold text-lg text-gray-900">topsports</div>
                  <div className="text-xs text-gray-500">{totalSessions} sessions</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-2xl font-bold text-gray-800">{totalPageViews}</div>
                  <div className="text-xs text-gray-500">Page Views</div>
                </div>

                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-2xl font-bold text-gray-800">{sumUniquePages}</div>
                  <div className="text-xs text-gray-500">Unique Pages</div>
                </div>

                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-2xl font-bold text-rose-500">{totalClicks}</div>
                  <div className="text-xs text-gray-500">Total Clicks</div>
                </div>

                <div className="p-3 rounded-md bg-gray-50">
                  <div className="text-2xl font-bold text-indigo-600">{sumUniqueClicks}</div>
                  <div className="text-xs text-gray-500">Unique Clicks</div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-end gap-3">
              <div className="flex gap-3">
                <select className="rounded-md px-3 py-2 bg-white/90 text-sm">
                  <option>All Countries</option>
                </select>
                <select className="rounded-md px-3 py-2 bg-white/90 text-sm">
                  <option>All Sources</option>
                </select>
              </div>
              <div className="mt-2 text-xs text-white/90">Showing latest sessions</div>
            </div>
          </div>

          <div className="space-y-5">
            {sessionsWithMeta.map((session: any, index: number) => {
              const sessionKey = session.session_id || session.id || index;
              const isOpen = openSession === (session.session_id || session.id);

              return (
                <div
                  key={sessionKey}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: SESSION_BOX_BG,
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: "12px",
                  }}
                >
                  <div className="p-2 flex items-start gap-4">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: AVATAR_BG }}
                    >
                      d
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div style={{ minWidth: 0 }}>
                          <div className="font-semibold truncate text-white">
                            {`session_${String(session.session_id).slice(0, 12)}...`}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            {session.device || "desktop"} · {session.source || "Browser"}
                          </div>
                          <div className="text-xs text-white/70 truncate">{session.ip_address}</div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-sm text-right text-white">
                            <div className="font-bold text-lg">{session.page_views || 0}</div>
                            <div className="text-xs text-white/80">Page Views</div>
                            <div className="text-xs text-white/70">Unique: {session.unique_pages || 0}</div>
                          </div>

                          <div className="text-sm text-right text-white">
                            <div className="font-bold text-lg">{session.total_clicks || 0}</div>
                            <div className="text-xs text-white/80">Total Clicks</div>
                            <div className="text-xs text-white/70">Unique: {session.unique_clicks || 0}</div>
                          </div>

                          <button
                            onClick={() =>
                              setOpenSession(
                                isOpen ? null : (session.session_id || session.id)
                              )
                            }
                            className="ml-2 px-3 py-1 rounded-md bg-white/10 text-xs text-white"
                          >
                            {isOpen ? "Hide" : "Details"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 border-t pt-3 text-xs text-white/70 flex gap-6 items-center">
                        <div className="truncate">Last: {fmt(session.last_active)}</div>
                        <div className="truncate">Events: {session.events_count}</div>
                        <div className="truncate">Country: {session.country || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      className="mt-3 p-3 rounded-md"
                      style={{
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        <div className="rounded-md border p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex items-center justify-between text-white">
                            <div className="font-semibold">Related Search Clicks</div>
                            <div className="text-xs text-white/70">
                              Unique:{" "}
                              {session.related_searches?.reduce(
                                (a: number, b: any) => a + (b.unique || 0),
                                0
                              ) || 0}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-white/80">
                            {session.related_searches?.length ? (
                              session.related_searches.map((r: any, i: number) => (
                                <div key={i} className="flex justify-between py-1">
                                  <div className="truncate">{r.query}</div>
                                  <div className="text-xs text-white/70">Total: {r.total}</div>
                                </div>
                              ))
                            ) : (
                              <div className="text-white/70">No related searches</div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-md border p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="font-semibold text-white">Blog Clicks</div>
                          <div className="mt-2 text-sm text-white/80">
                            {session.blog_clicks > 0 ? `${session.blog_clicks} clicks` : "No blog clicks"}
                          </div>
                        </div>

                        <div className="rounded-md border p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="font-semibold text-white">Visit Now Clicks</div>
                          <div className="mt-2 text-sm text-white/80">
                            {session.search_clicks > 0 ? `${session.search_clicks} clicks` : "No visit now clicks"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-white/80">
                        <div>IP: {session.ip_address}</div>
                        <div>Device: {session.device}</div>
                        <div>Source: {session.source}</div>
                        <div>Email Captures: {session.email_captures}</div>
                        <div>Prelanding: {session.prelanding_clicks}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
