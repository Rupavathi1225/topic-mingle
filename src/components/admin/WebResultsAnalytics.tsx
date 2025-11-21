// FULL WORKING VERSION — WebResultsAnalytics.tsx

import { useEffect, useState } from "react";
import { webResultsClient } from "@/integrations/webresults/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const COLORS = [
  "bg-[#5B2AFF]",
  "bg-[#6F3FFF]",
  "bg-[#8A5CFF]",
  "bg-[#9F7BFF]",
  "bg-[#B39AFF]",
];

const WebResultsAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [clickEvents, setClickEvents] = useState<any[]>([]);
  const [sessionDetails, setSessionDetails] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [emails, setEmails] = useState<any[]>([]);

  const [countryFilter, setCountryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPageViews: 0,
    totalClicks: 0,
    relatedSearches: 0,
    resultClicks: 0,
    avgTimeSpent: 0,
  });

  useEffect(() => {
    fetchAnalytics();
    fetchEmails();
  }, [countryFilter, sourceFilter]);

  // ⭐ FIXED EMAILS FETCHING
  const fetchEmails = async () => {
    const { data, error } = await webResultsClient
      .from("email_captures")
      .select("*")
      .order("captured_at", { ascending: false });

    if (error) {
      console.error("Email fetch error:", error);
      return;
    }

    if (data) setEmails(data);
  };

  const fetchAnalytics = async () => {
    let analyticsQuery = webResultsClient
      .from("analytics")
      .select("*")
      .order("timestamp", { ascending: false });

    let clicksQuery = webResultsClient
      .from("click_events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (countryFilter) analyticsQuery = analyticsQuery.eq("country", countryFilter);
    if (sourceFilter) analyticsQuery = analyticsQuery.eq("source", sourceFilter);
    if (countryFilter) clicksQuery = clicksQuery.eq("country", countryFilter);
    if (sourceFilter) clicksQuery = clicksQuery.eq("source", sourceFilter);

    const { data: analyticsData } = await analyticsQuery;
    const { data: clicksData } = await clicksQuery;

    if (analyticsData) {
      setAnalytics(analyticsData);

      const totalPageViews = analyticsData.reduce((s, i) => s + (i.page_views || 0), 0);
      const totalClicks = analyticsData.reduce((s, i) => s + (i.clicks || 0), 0);
      const relatedSearches = analyticsData.reduce((s, i) => s + (i.related_searches || 0), 0);
      const resultClicks = analyticsData.reduce((s, i) => s + (i.result_clicks || 0), 0);
      const avgTime = analyticsData.reduce((s, i) => s + (i.time_spent || 0), 0) / analyticsData.length;

      setStats({
        totalSessions: analyticsData.length,
        totalPageViews,
        totalClicks,
        relatedSearches,
        resultClicks,
        avgTimeSpent: Math.round(avgTime / 1000),
      });
    }

    if (clicksData) setClickEvents(clicksData);
  };

  const toggleDetails = async (sessionId: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(sessionId)) newSet.delete(sessionId);
    else {
      newSet.add(sessionId);
      if (!sessionDetails[sessionId]) {
        const { data } = await webResultsClient
          .from("click_events")
          .select("*")
          .eq("session_id", sessionId);

        setSessionDetails((p) => ({ ...p, [sessionId]: data || [] }));
      }
    }
    setExpanded(newSet);
  };

  return (
    <div className="space-y-8 p-4">

      {/* TOP SUMMARY */}
      <div className="bg-[#5B2AFF] text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold">webresults</h2>
        <p className="opacity-80 text-sm mb-4">{stats.totalSessions} sessions</p>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{stats.totalPageViews}</p>
            <p className="opacity-80 text-sm">Page Views</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalClicks}</p>
            <p className="opacity-80 text-sm">Total Clicks</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.resultClicks}</p>
            <p className="opacity-80 text-sm">Unique Clicks</p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex justify-end gap-4">
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-40 bg-white border">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">USA</SelectItem>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="GB">UK</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40 bg-white border">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="meta">Meta</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* EMAIL CAPTURES */}
      <Card className="p-6 shadow-lg rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Captured Emails</h3>

        {emails.length ? (
          <div className="space-y-3">
            {emails.map((item, i) => (
              <div
                key={i}
                className="flex justify-between bg-gray-100 p-3 rounded-lg border text-sm"
              >
                <span className="font-medium">{item.email}</span>
                <span className="text-gray-500">
                  {item.captured_at
                    ? new Date(item.captured_at).toLocaleString()
                    : "No timestamp"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No emails captured yet.</p>
        )}
      </Card>

      {/* SESSIONS LIST */}
      <div className="space-y-8">
        {analytics.map((session, index) => {
          const color = COLORS[index % COLORS.length];
          const isOpen = expanded.has(session.session_id);
          const details = sessionDetails[session.session_id] || [];

          return (
            <Card key={session.session_id} className="shadow-xl rounded-xl overflow-hidden">
              <div className={`p-5 text-white ${color}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {session.device} • {session.source || "direct"}
                    </h3>
                    <p className="text-sm opacity-80">
                      {session.session_id.substring(0, 12)}… —
                      {session.ip_address} — {session.country}
                    </p>
                  </div>

                  <div className="flex gap-6 text-center text-sm">
                    <div>
                      <p className="font-bold text-lg">{session.page_views || 0}</p>
                      <p className="opacity-80">Page Views</p>
                    </div>

                    <div>
                      <p className="font-bold text-lg">{session.clicks || 0}</p>
                      <p className="opacity-80">Total Clicks</p>
                    </div>

                    <Button
                      onClick={() => toggleDetails(session.session_id)}
                      className="bg-white text-black rounded-md px-3 hover:bg-gray-200"
                    >
                      {isOpen ? "Hide" : "Details"}
                    </Button>
                  </div>
                </div>
              </div>

              {isOpen && (
                <CardContent className="p-6 bg-gray-50 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Click Events</h4>
                    {details.length ? (
                      <div className="space-y-2">
                        {details.map((e, i) => (
                          <div
                            key={i}
                            className="bg-white p-2 border rounded text-sm flex justify-between"
                          >
                            <span>{e.event_type}</span>
                            <span className="text-gray-500">
                              {new Date(e.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No click events</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Session Info</h4>
                    <p className="text-sm">IP: {session.ip_address}</p>
                    <p className="text-sm">
                      Last Active: {new Date(session.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm">Source: {session.source}</p>
                    <p className="text-sm">Device: {session.device}</p>
                    <p className="text-sm">Events: {details.length}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WebResultsAnalytics;
