import { useEffect, useState } from "react";
import { webResultsClient } from "@/integrations/webresults/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const COLORS = [
  "bg-[#F97316]", // Orange
  "bg-[#3182CE]", // Blue
  "bg-[#9F7AEA]", // Purple
  "bg-[#38A169]", // Green
  "bg-[#E53E3E]", // Red
];

const WebResultsAnalytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [clickEvents, setClickEvents] = useState<any[]>([]);
  const [sessionDetails, setSessionDetails] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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
  }, [countryFilter, sourceFilter]);

  const fetchAnalytics = async () => {
    // Fetch analytics (sessions)
    let analyticsQuery = webResultsClient
      .from("analytics")
      .select("*")
      .order("timestamp", { ascending: false });

    let clicksQuery = webResultsClient
      .from("click_events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (countryFilter) {
      analyticsQuery = analyticsQuery.eq("country", countryFilter);
      clicksQuery = clicksQuery.eq("country", countryFilter);
    }
    if (sourceFilter) {
      analyticsQuery = analyticsQuery.eq("source", sourceFilter);
      clicksQuery = clicksQuery.eq("source", sourceFilter);
    }

    const { data: analyticsData } = await analyticsQuery;
    const { data: clicksData } = await clicksQuery;

    if (analyticsData) {
      setAnalytics(analyticsData);

      const totalPageViews = analyticsData.reduce((sum, item) => sum + (item.page_views || 0), 0);
      const totalClicks = analyticsData.reduce((sum, item) => sum + (item.clicks || 0), 0);
      const relatedSearches = analyticsData.reduce((sum, item) => sum + (item.related_searches || 0), 0);
      const resultClicks = analyticsData.reduce((sum, item) => sum + (item.result_clicks || 0), 0);
      const avgTime = analyticsData.reduce((sum, item) => sum + (item.time_spent || 0), 0) / analyticsData.length;

      setStats({
        totalSessions: analyticsData.length,
        totalPageViews,
        totalClicks,
        relatedSearches,
        resultClicks,
        avgTimeSpent: Math.round(avgTime / 1000),
      });
    }

    if (clicksData) {
      setClickEvents(clicksData);
    }
  };

  const toggleDetails = async (sessionId: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId);
      setExpanded(newSet);
    } else {
      newSet.add(sessionId);
      setExpanded(newSet);

      // Load click event details if not already fetched
      if (!sessionDetails[sessionId]) {
        const { data } = await webResultsClient
          .from("click_events")
          .select("*")
          .eq("session_id", sessionId);

        setSessionDetails((prev) => ({
          ...prev,
          [sessionId]: data || [],
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Related Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.relatedSearches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Result Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.resultClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle classPlain="text-sm font-medium text-muted-foreground">Avg Time (s)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.avgTimeSpent}</div>
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
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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

      {/* Session Cards */}
      <div className="space-y-6">
        {analytics.map((session, index) => {
          const color = COLORS[index % COLORS.length];
          const isOpen = expanded.has(session.session_id);
          const details = sessionDetails[session.session_id] || [];

          return (
            <Card className="overflow-hidden shadow-md" key={session.session_id}>
              {/* Colored header bar */}
              <div className={`p-4 ${color} text-white`}>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {session.device} • {session.source || "direct"}
                    </h3>
                    <p className="text-sm opacity-90">
                      {session.session_id.substring(0, 12)}… — {session.ip_address} —{" "}
                      {session.country || "–"}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="font-bold text-lg">{session.page_views || 0}</div>
                      <div>Page Views</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{session.clicks || 0}</div>
                      <div>Total Clicks</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{session.related_searches || 0}</div>
                      <div>Searches</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{session.result_clicks || 0}</div>
                      <div>Search Clicks</div>
                    </div>

                    <Button
                      onClick={() => toggleDetails(session.session_id)}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      {isOpen ? "Hide" : "Details"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded white detail section */}
              {isOpen && (
                <CardContent className="p-6 bg-gray-50 space-y-6">
                  {/* Related Searches */}
                  <div>
                    <h4 className="font-semibold mb-2">Related Searches</h4>
                    {session.related_searches_list?.length ? (
                      <div className="flex gap-2 flex-wrap">
                        {session.related_searches_list.map((s: string, i: number) => (
                          <Badge variant="outline" key={i}>
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No related searches</p>
                    )}
                  </div>

                  {/* Click Events / Blog Clicks */}
                  <div>
                    <h4 className="font-semibold mb-2">Click Events</h4>
                    {details.length ? (
                      <div className="space-y-2">
                        {details.map((e: any, i: number) => (
                          <div
                            key={i}
                            className="bg-white p-2 rounded border text-sm flex justify-between"
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

                  {/* Session Info */}
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
