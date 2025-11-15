import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminRelatedSearches = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [relatedSearches, setRelatedSearches] = useState<any[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingSearch, setEditingSearch] = useState<any>(null);

  const [formData, setFormData] = useState({
    blog_id: "",
    search_text: "",
    target_url: "",
    order_number: 0
  });

  useEffect(() => {
    fetchBlogs();
    fetchRelatedSearches();
  }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('id, title, serial_number, categories(name)')
      .eq('status', 'published')
      .order('title');
    if (data) setBlogs(data);
  };

  const fetchRelatedSearches = async () => {
    const { data } = await supabase
      .from('related_searches')
      .select('*, blogs(title, serial_number, categories(name))')
      .order('created_at', { ascending: false });
    if (data) setRelatedSearches(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSearch) {
      const { error } = await supabase
        .from('related_searches')
        .update(formData)
        .eq('id', editingSearch.id);

      if (error) {
        toast.error("Error updating related search");
      } else {
        toast.success("Related search updated successfully");
        resetForm();
        fetchRelatedSearches();
      }
    } else {
      const { error } = await supabase
        .from('related_searches')
        .insert([formData]);

      if (error) {
        toast.error("Error creating related search");
      } else {
        toast.success("Related search created successfully");
        resetForm();
        fetchRelatedSearches();
      }
    }
  };

  const handleEdit = (search: any) => {
    setEditingSearch(search);
    setIsCreating(true);
    setFormData({
      blog_id: search.blog_id,
      search_text: search.search_text,
      target_url: search.target_url,
      order_number: search.order_number || 0
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this related search?")) {
      const { error } = await supabase.from('related_searches').delete().eq('id', id);
      if (error) {
        toast.error("Error deleting related search");
      } else {
        toast.success("Related search deleted successfully");
        fetchRelatedSearches();
      }
    }
  };

  const resetForm = () => {
    setEditingSearch(null);
    setIsCreating(false);
    setFormData({
      blog_id: "",
      search_text: "",
      target_url: "",
      order_number: 0
    });
  };

  const filteredSearches = selectedBlogId
    ? relatedSearches.filter(s => s.blog_id === selectedBlogId)
    : relatedSearches;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Related Searches Management</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Related Search
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Filter by Blog</label>
          <Select value={selectedBlogId} onValueChange={setSelectedBlogId}>
            <SelectTrigger>
              <SelectValue placeholder="All blogs" />
            </SelectTrigger>
            <SelectContent>
              {blogs.map((blog) => (
                <SelectItem key={blog.id} value={blog.id}>
                  [{blog.serial_number}] {blog.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedBlogId && (
          <Button variant="outline" onClick={() => setSelectedBlogId("")}>
            Clear Filter
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSearch ? "Edit Related Search" : "Create New Related Search"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Blog</label>
                <Select
                  value={formData.blog_id}
                  onValueChange={(value) => setFormData({ ...formData, blog_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blog" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogs.map((blog) => (
                      <SelectItem key={blog.id} value={blog.id}>
                        [{blog.serial_number}] {blog.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Search Text</label>
                <Input
                  value={formData.search_text}
                  onChange={(e) => setFormData({ ...formData, search_text: e.target.value })}
                  placeholder="e.g., try for finance"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Target URL</label>
                <Input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Order Number</label>
                <Input
                  type="number"
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingSearch ? "Update" : "Create"} Related Search</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredSearches.map((search) => (
          <Card key={search.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{search.blogs?.categories?.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      [{search.blogs?.serial_number}] {search.blogs?.title}
                    </span>
                  </div>
                  <h3 className="font-bold">{search.search_text}</h3>
                  <p className="text-sm text-muted-foreground truncate">{search.target_url}</p>
                  <Badge variant="outline" className="mt-2">Order: {search.order_number}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(search)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(search.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminRelatedSearches;
