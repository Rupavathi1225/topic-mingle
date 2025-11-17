import { useQuery } from "@tanstack/react-query";
import { topsportsClient } from "@/integrations/topsports/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const TopSportsAnalytics = () => {
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['topsports-sessions'],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: clicks, isLoading: clicksLoading } = useQuery({
    queryKey: ['topsports-clicks'],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from('clicks')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const totalSessions = sessions?.length || 0;
  const totalClicks = clicks?.length || 0;
  const pageViewClicks = clicks?.filter(c => c.item_type === 'page_view').length || 0;
  const webResultClicks = clicks?.filter(c => c.item_type === 'web_result').length || 0;

  if (sessionsLoading || clicksLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageViewClicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Web Result Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webResultClicks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.slice(0, 10).map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-xs">{session.session_id}</TableCell>
                  <TableCell>{session.ip_address}</TableCell>
                  <TableCell>{session.country}</TableCell>
                  <TableCell>{session.device}</TableCell>
                  <TableCell>{session.source}</TableCell>
                  <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Type</TableHead>
                <TableHead>Item Title</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clicks?.slice(0, 20).map((click) => (
                <TableRow key={click.id}>
                  <TableCell className="capitalize">{click.item_type}</TableCell>
                  <TableCell>{click.item_title || 'N/A'}</TableCell>
                  <TableCell>{click.page}</TableCell>
                  <TableCell>{click.country}</TableCell>
                  <TableCell>{click.device}</TableCell>
                  <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopSportsAnalytics;
