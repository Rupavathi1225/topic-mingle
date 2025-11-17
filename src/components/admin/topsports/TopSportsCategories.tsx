import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topsportsClient } from "@/integrations/topsports/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

const TopSportsCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    serial_number: 1,
    wr_page: 1
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['topsports-categories'],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from('categories')
        .select('*')
        .order('serial_number', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await topsportsClient.from('categories').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-categories'] });
      toast({ title: "Category added successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await topsportsClient.from('categories').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-categories'] });
      toast({ title: "Category updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await topsportsClient.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-categories'] });
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({ title: '', serial_number: 1, wr_page: 1 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (category: any) => {
    setFormData({
      title: category.title,
      serial_number: category.serial_number,
      wr_page: category.wr_page
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Category' : 'Add New Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium">WR Page</label>
                  <Input
                    type="number"
                    value={formData.wr_page}
                    onChange={(e) => setFormData({ ...formData, wr_page: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>WR Page</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.serial_number}</TableCell>
                  <TableCell>{category.title}</TableCell>
                  <TableCell>{category.wr_page}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(category.id)}>
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

export default TopSportsCategories;
