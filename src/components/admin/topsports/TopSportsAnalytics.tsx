import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { topsportsClient } from "@/integrations/topsports/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const colors = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-rose-500",
];

const TopSportsAnalytics = () => {
  const [openSession, setOpenSession] = useState(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["topsports-sessions"],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: clicks, isLoading: clicksLoading } = useQuery({
    queryKey: ["topsports-clicks"],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from("clicks")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (sessionsLoading || clicksLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ------- STAT CARDS (UNCHANGED) ------- */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clicks?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clicks?.filter((c) => c.item_type === "page_view").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Web Result Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clicks?.filter((c) => c.item_type === "web_result").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------- SESSION LIST (NEW UI LIKE YOUR SCREENSHOT) ------- */}
      <div className="space-y-5">
        {sessions?.map((session, index) => {
          const color = colors[index % colors.length];
          const isOpen = openSession === session.id;

          return (
            <div key={session.id} className="border rounded-xl overflow-hidden shadow-sm">
              {/* HEADER BLOCK */}
              <div className={`${color} text-white p-4 flex justify-between items-center`}>
                <div>
                  <div className="font-semibold capitalize">
                    {session.device} · {session.source}
                  </div>

                  <div className="text-sm opacity-90">
                    {session.session_id?.slice(0, 8)}... • {session.ip_address} •{" "}
                    {session.country}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-right text-sm">
                  <div>
                    <div className="font-bold text-lg">{session.page_views}</div>
                    <div>Page Views</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{session.total_clicks}</div>
                    <div>Total Clicks</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{session.blog_clicks}</div>
                    <div>Blog Clicks</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{session.search_clicks}</div>
                    <div>Search Clicks</div>
                  </div>
                </div>

                <button
                  onClick={() => setOpenSession(isOpen ? null : session.id)}
                  className="bg-white/20 px-4 py-1 rounded-md text-sm"
                >
                  {isOpen ? "Hide" : "Details"}
                </button>
              </div>

              {/* EXPANDED DETAILS */}
              {isOpen && (
                <div className="bg-white p-5 grid grid-cols-3 gap-5 border-t">
                  {/* Related Searches */}
                  <div>
                    <h3 className="font-semibold mb-2">Related Searches</h3>
                    <div className="border rounded-lg p-3 text-sm">
                      {session.related_searches?.length ? (
                        session.related_searches.map((s, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{s.query}</span>
                            <span className="text-gray-500 text-xs">
                              Total: {s.total} · Unique: {s.unique}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">No searches</span>
                      )}
                    </div>
                  </div>

                  {/* Blog Clicks */}
                  <div>
                    <h3 className="font-semibold mb-2">Blog Clicks</h3>
                    <div className="border rounded-lg p-3 text-sm">
                      {session.blog_clicks > 0 ? (
                        `${session.blog_clicks} blog clicks`
                      ) : (
                        <span className="text-gray-500">No blog clicks</span>
                      )}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Session Info</h3>
                    <div className="border rounded-lg p-3 text-sm space-y-1">
                      <div>IP: {session.ip_address}</div>
                      <div>Last Active: {new Date(session.created_at).toLocaleString()}</div>
                      <div>Source: {session.source}</div>
                      <div>Device: {session.device}</div>
                      <div>Events: {session.events_count}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSportsAnalytics;
