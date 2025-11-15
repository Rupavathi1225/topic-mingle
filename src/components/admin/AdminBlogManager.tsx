import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category_id: 0,
    author: "",
    content: "",
    featured_image: "",
    status: "draft",
    serial_number: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBlog) {
      const { error } = await supabase
        .from('blogs')
        .update(formData)
        .eq('id', editingBlog.id);

      if (error) {
        toast.error("Error updating blog");
      } else {
        toast.success("Blog updated successfully");
        resetForm();
        fetchBlogs();
      }
    } else {
      const { error } = await supabase
        .from('blogs')
        .insert([{ ...formData, published_at: new Date().toISOString() }]);

      if (error) {
        toast.error("Error creating blog");
      } else {
        toast.success("Blog created successfully");
        resetForm();
        fetchBlogs();
      }
    }
  };

  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    setIsCreating(true);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category_id: blog.category_id,
      author: blog.author,
      content: blog.content,
      featured_image: blog.featured_image || "",
      status: blog.status,
      serial_number: blog.serial_number || 0
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) {
        toast.error("Error deleting blog");
      } else {
        toast.success("Blog deleted successfully");
        fetchBlogs();
      }
    }
  };

  const resetForm = () => {
    setEditingBlog(null);
    setIsCreating(false);
    setFormData({
      title: "",
      slug: "",
      category_id: 0,
      author: "",
      content: "",
      featured_image: "",
      status: "draft",
      serial_number: 0
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Blog
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBlog ? "Edit Blog" : "Create New Blog"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                  }}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Serial Number</label>
                <Input
                  type="number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Author</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Featured Image URL</label>
                <Input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingBlog ? "Update" : "Create"} Blog</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {blogs.map((blog) => (
          <Card key={blog.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{blog.serial_number}</Badge>
                    <Badge>{blog.categories?.name}</Badge>
                    <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                      {blog.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg">{blog.title}</h3>
                  <p className="text-sm text-muted-foreground">by {blog.author}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}>
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

export default AdminBlogManager;
