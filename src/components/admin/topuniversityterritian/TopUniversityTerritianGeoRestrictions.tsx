import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { topUniversityTerritianClient } from "@/integrations/topuniversityterritian/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WebResult {
  id: string;
  title: string;
  allowed_countries: string[];
  wr_page: number;
}

const TopUniversityTerritianGeoRestrictions = () => {
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<WebResult | null>(null);
  const [countries, setCountries] = useState<string>("");

  useEffect(() => {
    fetchWebResults();
  }, []);

  const fetchWebResults = async () => {
    try {
      const { data, error } = await topUniversityTerritianClient
        .from("web_results")
        .select("id, title, allowed_countries, wr_page")
        .order("wr_page", { ascending: true });

      if (error) throw error;
      setWebResults(data || []);
    } catch (error) {
      console.error("Error fetching web results:", error);
      toast.error("Failed to load web results");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    try {
      const countriesArray = countries
        .split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const { error } = await topUniversityTerritianClient
        .from("web_results")
        .update({ allowed_countries: countriesArray })
        .eq("id", editingResult.id);

      if (error) throw error;
      toast.success("Geo-restrictions updated successfully");
      setIsDialogOpen(false);
      setEditingResult(null);
      setCountries("");
      fetchWebResults();
    } catch (error) {
      console.error("Error updating geo-restrictions:", error);
      toast.error("Failed to update geo-restrictions");
    }
  };

  const handleEdit = (result: WebResult) => {
    setEditingResult(result);
    setCountries((result.allowed_countries || []).join(", "));
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geo-Restrictions Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Manage which countries can access each web result. Use "worldwide" for global access or specify country codes (e.g., US, UK, IN).
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WR Page</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Allowed Countries</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No web results found.
                </TableCell>
              </TableRow>
            ) : (
              webResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.wr_page}</TableCell>
                  <TableCell>{result.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(result.allowed_countries || ["worldwide"]).map((country, idx) => (
                        <Badge key={idx} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(result)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Geo-Restrictions</DialogTitle>
            </DialogHeader>
            {editingResult && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Web Result</Label>
                  <p className="text-sm text-foreground mt-1">{editingResult.title}</p>
                </div>
                <div>
                  <Label htmlFor="countries">Allowed Countries</Label>
                  <Input
                    id="countries"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="worldwide, US, UK, IN (comma-separated)"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter country codes separated by commas. Use "worldwide" for global access.
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Update Geo-Restrictions
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TopUniversityTerritianGeoRestrictions;
