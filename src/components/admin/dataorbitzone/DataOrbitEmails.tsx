import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface EmailRecord {
  id: string;
  email: string;
  related_search_id: string | null;
  created_at: string;
}

const DataOrbitEmails = () => {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEmails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prelanding_emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching emails:", error);
    } else {
      setEmails(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Collected Emails</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>Loading emails...</p>
        ) : emails.length === 0 ? (
          <p>No emails found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Related Search ID</th>
                <th className="py-2 px-3">Created At</th>
              </tr>
            </thead>

            <tbody>
              {emails.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-3">{item.email}</td>
                  <td className="py-2 px-3">
                    {item.related_search_id || "—"}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default DataOrbitEmails;
