import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topUniversityTerritianClient } from "@/integrations/topuniversityterritian/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const TopUniversityTerritianLandingPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const { data: landingContent, isLoading } = useQuery({
    queryKey: ['tut-landing-content'],
    queryFn: async () => {
      const { data, error } = await topUniversityTerritianClient
        .from('landing_content')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          description: data.description
        });
      }
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (landingContent?.id) {
        const { error } = await topUniversityTerritianClient
          .from('landing_content')
          .update(data)
          .eq('id', landingContent.id);
        if (error) throw error;
      } else {
        const { error } = await topUniversityTerritianClient
          .from('landing_content')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tut-landing-content'] });
      toast({ title: "Landing page content updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update landing page content", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
      <CardHeader>
        <CardTitle>Edit Landing Page Content</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter landing page title"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter landing page description"
              rows={5}
              required
            />
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TopUniversityTerritianLandingPage;
