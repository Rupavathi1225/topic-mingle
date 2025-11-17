import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topsportsClient } from "@/integrations/topsports/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TopSportsWebResults = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    wr_page: 1,
    result_type: 'regular',
    offer_name: '',
    title: '',
    description: '',
    original_url: '',
    logo_url: '',
    serial_number: 1,
    worldwide_backlink: ''
  });

  const { data: webResults, isLoading } = useQuery({
    queryKey: ['topsports-web-results'],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from('web_results')
        .select('*')
        .order('serial_number', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await topsportsClient.from('web_results').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-web-results'] });
      toast({ title: "Web result added successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to add web result", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await topsportsClient.from('web_results').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-web-results'] });
      toast({ title: "Web result updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update web result", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await topsportsClient.from('web_results').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-web-results'] });
      toast({ title: "Web result deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete web result", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      wr_page: 1,
      result_type: 'regular',
      offer_name: '',
      title: '',
      description: '',
      original_url: '',
      logo_url: '',
      serial_number: 1,
      worldwide_backlink: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (result: any) => {
    setFormData({
      wr_page: result.wr_page,
      result_type: result.result_type,
      offer_name: result.offer_name || '',
      title: result.title,
      description: result.description,
      original_url: result.original_url,
      logo_url: result.logo_url || '',
      serial_number: result.serial_number,
      worldwide_backlink: result.worldwide_backlink || ''
    });
    setEditingId(result.id);
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
        <h2 className="text-2xl font-bold">Web Results Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Web Result
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Web Result' : 'Add New Web Result'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">WR Page</label>
                  <Input
                    type="number"
                    value={formData.wr_page}
                    onChange={(e) => setFormData({ ...formData, wr_page: parseInt(e.target.value) })}
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
                  <label className="text-sm font-medium">Result Type</label>
                  <Select value={formData.result_type} onValueChange={(value) => setFormData({ ...formData, result_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Offer Name</label>
                  <Input
                    value={formData.offer_name}
                    onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Original URL</label>
                <Input
                  value={formData.original_url}
                  onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Worldwide Backlink</label>
                <Input
                  value={formData.worldwide_backlink}
                  onChange={(e) => setFormData({ ...formData, worldwide_backlink: e.target.value })}
                  placeholder="Optional"
                />
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
                <TableHead>Serial</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webResults?.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.serial_number}</TableCell>
                  <TableCell>{result.wr_page}</TableCell>
                  <TableCell className="capitalize">{result.result_type}</TableCell>
                  <TableCell>{result.title}</TableCell>
                  <TableCell className="max-w-md truncate">{result.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(result)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(result.id)}>
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

export default TopSportsWebResults;
