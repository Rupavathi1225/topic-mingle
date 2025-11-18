import { useQuery } from "@tanstack/react-query";
import { topUniversityTerritianClient } from "@/integrations/topuniversityterritian/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const TopUniversityTerritianEmailCaptures = () => {
  const { data: emailCaptures, isLoading } = useQuery({
    queryKey: ['tut-email-captures'],
    queryFn: async () => {
      const { data, error } = await topUniversityTerritianClient
        .from('email_captures')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Captures</CardTitle>
      </CardHeader>
      <CardContent>
        {emailCaptures && emailCaptures.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Captured At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailCaptures.map((capture) => (
                <TableRow key={capture.id}>
                  <TableCell>{capture.email}</TableCell>
                  <TableCell>{capture.country || 'N/A'}</TableCell>
                  <TableCell>{capture.device || 'N/A'}</TableCell>
                  <TableCell>{new Date(capture.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No email captures yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopUniversityTerritianEmailCaptures;
