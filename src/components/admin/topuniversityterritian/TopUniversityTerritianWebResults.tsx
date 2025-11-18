import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topUniversityTerritianClient } from "@/integrations/topuniversityterritian/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TopUniversityTerritianWebResults = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    wr_page: 1,
    result_type: 'regular',
    offer_name: '',
    title: '',
    description: '',
    original_url: '',
    logo_url: '',
    serial_number: 0,
    allowed_countries: ['worldwide'],
    worldwide_backlink: ''
  });

  const { data: webResults, isLoading } = useQuery({
    queryKey: ['tut-web-results'],
    queryFn: async () => {
      const { data, error } = await topUniversityTerritianClient
        .from('web_results')
        .select('*')
        .order('wr_page', { ascending: true })
        .order('serial_number', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await topUniversityTerritianClient
        .from('web_results')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tut-web-results'] });
      toast({ title: "Web result created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create web result", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await topUniversityTerritianClient
        .from('web_results')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tut-web-results'] });
      toast({ title: "Web result updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update web result", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await topUniversityTerritianClient
        .from('web_results')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tut-web-results'] });
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
      serial_number: 0,
      allowed_countries: ['worldwide'],
      worldwide_backlink: ''
    });
    setEditingResult(null);
  };

  const handleEdit = (result: any) => {
    setEditingResult(result);
    setFormData({
      wr_page: result.wr_page,
      result_type: result.result_type,
      offer_name: result.offer_name || '',
      title: result.title,
      description: result.description,
      original_url: result.original_url,
      logo_url: result.logo_url || '',
      serial_number: result.serial_number || 0,
      allowed_countries: result.allowed_countries || ['worldwide'],
      worldwide_backlink: result.worldwide_backlink || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResult) {
      updateMutation.mutate({ id: editingResult.id, data: formData });
    } else {
      createMutation.mutate(formData);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Web Results</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Web Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResult ? 'Edit Web Result' : 'Add Web Result'}</DialogTitle>
            </DialogHeader>
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
                  />
                </div>
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
                />
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
                />
              </div>
              <div>
                <label className="text-sm font-medium">Worldwide Backlink</label>
                <Input
                  value={formData.worldwide_backlink}
                  onChange={(e) => setFormData({ ...formData, worldwide_backlink: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingResult ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WR Page</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webResults?.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.wr_page}</TableCell>
                <TableCell>{result.serial_number}</TableCell>
                <TableCell className="capitalize">{result.result_type}</TableCell>
                <TableCell>{result.title}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(result)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(result.id)}
                    >
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
  );
};

export default TopUniversityTerritianWebResults;
