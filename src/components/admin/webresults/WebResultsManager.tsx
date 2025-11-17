import { useEffect, useState } from "react";
import { webResultsClient } from "@/integrations/webresults/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

const WebResultsManager = () => {
  const [webResults, setWebResults] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    webresult_page: "",
    is_sponsored: false,
    offer_name: "",
    title: "",
    description: "",
    original_link: "",
    logo_url: "",
    serial_number: "",
    backlink_url: "",
    access_type: "worldwide",
    allowed_countries: ""
  });

  useEffect(() => {
    fetchWebResults();
  }, []);

  const fetchWebResults = async () => {
    const { data } = await webResultsClient
      .from('web_results')
      .select('*')
      .order('serial_number', { ascending: true });
    if (data) setWebResults(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const resultData = {
      webresult_page: formData.webresult_page,
      is_sponsored: formData.is_sponsored,
      offer_name: formData.offer_name || null,
      title: formData.title,
      description: formData.description,
      original_link: formData.original_link,
      logo_url: formData.logo_url || null,
      serial_number: parseInt(formData.serial_number),
      backlink_url: formData.backlink_url || null,
      access_type: formData.access_type,
      allowed_countries: formData.allowed_countries 
        ? JSON.parse(`[${formData.allowed_countries.split(',').map(c => `"${c.trim()}"`).join(',')}]`)
        : []
    };

    if (editingResult) {
      const { error } = await webResultsClient
        .from('web_results')
        .update(resultData)
        .eq('id', editingResult.id);
      
      if (error) {
        toast.error("Failed to update web result");
      } else {
        toast.success("Web result updated successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchWebResults();
      }
    } else {
      const { error } = await webResultsClient
        .from('web_results')
        .insert([resultData]);
      
      if (error) {
        toast.error("Failed to create web result");
      } else {
        toast.success("Web result created successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchWebResults();
      }
    }
  };

  const handleEdit = (result: any) => {
    setEditingResult(result);
    setFormData({
      webresult_page: result.webresult_page,
      is_sponsored: result.is_sponsored,
      offer_name: result.offer_name || "",
      title: result.title,
      description: result.description,
      original_link: result.original_link,
      logo_url: result.logo_url || "",
      serial_number: result.serial_number?.toString() || "",
      backlink_url: result.backlink_url || "",
      access_type: result.access_type,
      allowed_countries: Array.isArray(result.allowed_countries) 
        ? result.allowed_countries.join(', ') 
        : ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this web result?")) {
      const { error } = await webResultsClient
        .from('web_results')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Failed to delete web result");
      } else {
        toast.success("Web result deleted successfully");
        fetchWebResults();
      }
    }
  };

  const resetForm = () => {
    setEditingResult(null);
    setFormData({
      webresult_page: "",
      is_sponsored: false,
      offer_name: "",
      title: "",
      description: "",
      original_link: "",
      logo_url: "",
      serial_number: "",
      backlink_url: "",
      access_type: "worldwide",
      allowed_countries: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Web Results Manager</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Web Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResult ? "Edit Web Result" : "Add New Web Result"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Page Name</label>
                  <Input
                    value={formData.webresult_page}
                    onChange={(e) => setFormData({ ...formData, webresult_page: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Serial Number</label>
                  <Input
                    type="number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_sponsored}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_sponsored: checked })}
                />
                <label className="text-sm font-medium">Sponsored</label>
              </div>

              {formData.is_sponsored && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Offer Name</label>
                  <Input
                    value={formData.offer_name}
                    onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Original Link</label>
                <Input
                  value={formData.original_link}
                  onChange={(e) => setFormData({ ...formData, original_link: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Backlink URL</label>
                <Input
                  value={formData.backlink_url}
                  onChange={(e) => setFormData({ ...formData, backlink_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Access Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.access_type}
                  onChange={(e) => setFormData({ ...formData, access_type: e.target.value })}
                >
                  <option value="worldwide">Worldwide</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>

              {formData.access_type === 'restricted' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Allowed Countries (comma-separated)</label>
                  <Input
                    value={formData.allowed_countries}
                    onChange={(e) => setFormData({ ...formData, allowed_countries: e.target.value })}
                    placeholder="US, UK, CA"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingResult ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Web Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Sponsored</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Badge variant="outline">{result.serial_number}</Badge>
                  </TableCell>
                  <TableCell>{result.webresult_page}</TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {result.title}
                  </TableCell>
                  <TableCell>
                    {result.is_sponsored && (
                      <Badge variant="secondary">
                        {result.offer_name || 'Sponsored'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={result.access_type === 'worldwide' ? 'default' : 'outline'}>
                      {result.access_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(result)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(result.id)}>
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

export default WebResultsManager;
