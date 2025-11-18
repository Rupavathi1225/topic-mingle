import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { topUniversityTerritianClient } from "@/integrations/topuniversityterritian/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface PreLandingPage {
  id: string;
  headline: string;
  description: string;
  cta_text: string;
  background_color: string;
  email_placeholder: string;
  created_at: string;
}

const TopUniversityTerritianPreLanding = () => {
  const [pages, setPages] = useState<PreLandingPage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PreLandingPage | null>(null);
  const [formData, setFormData] = useState({
    headline: "",
    description: "",
    cta_text: "Get Started",
    background_color: "#ffffff",
    email_placeholder: "Enter your email"
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await topUniversityTerritianClient
        .from("pre_landing_pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pre-landing pages:", error);
      toast.error("Failed to load pre-landing pages");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage) {
        const { error } = await topUniversityTerritianClient
          .from("pre_landing_pages")
          .update(formData)
          .eq("id", editingPage.id);

        if (error) throw error;
        toast.success("Pre-landing page updated successfully");
      } else {
        const { error } = await topUniversityTerritianClient
          .from("pre_landing_pages")
          .insert([formData]);

        if (error) throw error;
        toast.success("Pre-landing page created successfully");
      }

      setIsDialogOpen(false);
      setEditingPage(null);
      setFormData({
        headline: "",
        description: "",
        cta_text: "Get Started",
        background_color: "#ffffff",
        email_placeholder: "Enter your email"
      });
      fetchPages();
    } catch (error) {
      console.error("Error saving pre-landing page:", error);
      toast.error("Failed to save pre-landing page");
    }
  };

  const handleEdit = (page: PreLandingPage) => {
    setEditingPage(page);
    setFormData({
      headline: page.headline || "",
      description: page.description || "",
      cta_text: page.cta_text || "Get Started",
      background_color: page.background_color || "#ffffff",
      email_placeholder: page.email_placeholder || "Enter your email"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pre-landing page?")) return;

    try {
      const { error } = await topUniversityTerritianClient
        .from("pre_landing_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Pre-landing page deleted successfully");
      fetchPages();
    } catch (error) {
      console.error("Error deleting pre-landing page:", error);
      toast.error("Failed to delete pre-landing page");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pre-Landing Pages</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPage(null);
                setFormData({
                  headline: "",
                  description: "",
                  cta_text: "Get Started",
                  background_color: "#ffffff",
                  email_placeholder: "Enter your email"
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Pre-Landing Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPage ? "Edit" : "Add"} Pre-Landing Page</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="background_color">Background Color</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email_placeholder">Email Placeholder</Label>
                  <Input
                    id="email_placeholder"
                    value={formData.email_placeholder}
                    onChange={(e) => setFormData({ ...formData, email_placeholder: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingPage ? "Update" : "Create"} Pre-Landing Page
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Headline</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>CTA Text</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No pre-landing pages found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.headline}</TableCell>
                  <TableCell className="max-w-xs truncate">{page.description}</TableCell>
                  <TableCell>{page.cta_text}</TableCell>
                  <TableCell>{new Date(page.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopUniversityTerritianPreLanding;
