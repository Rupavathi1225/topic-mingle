import { useEffect, useState } from "react";
import { dataOrbitZoneClient } from "@/integrations/dataorbitzone/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

const DataOrbitZoneRelatedSearches = () => {
  const [searches, setSearches] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<any>(null);
  const [formData, setFormData] = useState({
    search_text: "",
    target_url: "",
    blog_id: "",
    display_order: ""
  });

  useEffect(() => {
    fetchSearches();
    fetchBlogs();
  }, []);

  const fetchSearches = async () => {
    const { data } = await dataOrbitZoneClient
      .from('related_searches')
      .select('*, blogs(title, serial_number)')
      .order('display_order', { ascending: true });
    if (data) setSearches(data);
  };

  const fetchBlogs = async () => {
    const { data } = await dataOrbitZoneClient
      .from('blogs')
      .select('id, title, serial_number')
      .eq('status', 'published')
      .order('title');
    if (data) setBlogs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchData = {
      search_text: formData.search_text,
      target_url: formData.target_url,
      blog_id: formData.blog_id || null,
      display_order: formData.display_order ? parseInt(formData.display_order) : 0
    };

    if (editingSearch) {
      const { error } = await dataOrbitZoneClient
        .from('related_searches')
        .update(searchData)
        .eq('id', editingSearch.id);
      
      if (error) {
        toast.error("Failed to update search");
      } else {
        toast.success("Search updated successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchSearches();
      }
    } else {
      const { error } = await dataOrbitZoneClient
        .from('related_searches')
        .insert([searchData]);
      
      if (error) {
        toast.error("Failed to create search");
      } else {
        toast.success("Search created successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchSearches();
      }
    }
  };

  const handleEdit = (search: any) => {
    setEditingSearch(search);
    setFormData({
      search_text: search.search_text,
      target_url: search.target_url,
      blog_id: search.blog_id || "",
      display_order: search.display_order?.toString() || "0"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this search?")) {
      const { error } = await dataOrbitZoneClient
        .from('related_searches')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Failed to delete search");
      } else {
        toast.success("Search deleted successfully");
        fetchSearches();
      }
    }
  };

  const resetForm = () => {
    setEditingSearch(null);
    setFormData({
      search_text: "",
      target_url: "",
      blog_id: "",
      display_order: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">DataOrbitZone - Related Searches</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSearch ? "Edit Search" : "Add New Search"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Text</label>
                <Input
                  value={formData.search_text}
                  onChange={(e) => setFormData({ ...formData, search_text: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target URL</label>
                <Input
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Blog</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.blog_id}
                  onChange={(e) => setFormData({ ...formData, blog_id: e.target.value })}
                >
                  <option value="">Select Blog</option>
                  {blogs.map((blog) => (
                    <option key={blog.id} value={blog.id}>
                      {blog.serial_number ? `[${blog.serial_number}] ` : ''}{blog.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSearch ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Search Text</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead>Blog</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searches.map((search) => (
                <TableRow key={search.id}>
                  <TableCell>
                    <Badge variant="outline">{search.display_order}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{search.search_text}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                    {search.target_url}
                  </TableCell>
                  <TableCell>
                    {search.blogs ? (
                      <Badge variant="secondary">
                        {search.blogs.serial_number ? `[${search.blogs.serial_number}] ` : ''}
                        {search.blogs.title}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(search)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(search.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataOrbitZoneRelatedSearches;
