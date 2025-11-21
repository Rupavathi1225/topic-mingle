import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminEmails = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pre_landing_emails")
      .select(`
        id,
        email,
        ip_address,
        created_at,
        pre_landing_pages (
          headline
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching emails:", error);
    } else {
      setEmails(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Email Captures</CardTitle>
          <Button onClick={fetchEmails} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Landing Page</th>
                <th className="border px-3 py-2">IP Address</th>
                <th className="border px-3 py-2">Created At</th>
              </tr>
            </thead>

            <tbody>
              {emails.map((row, index) => (
                <tr key={row.id}>
                  <td className="border px-3 py-2">{index + 1}</td>
                  <td className="border px-3 py-2">{row.email}</td>
                  <td className="border px-3 py-2">
                    {row.pre_landing_pages?.headline || "Untitled Page"}
                  </td>
                  <td className="border px-3 py-2">{row.ip_address || "—"}</td>
                  <td className="border px-3 py-2">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {emails.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No emails found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEmails;
