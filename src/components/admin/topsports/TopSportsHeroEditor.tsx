import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topsportsClient } from "@/integrations/topsports/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const TopSportsHeroEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const { data: heroContent, isLoading } = useQuery({
    queryKey: ['topsports-hero-content'],
    queryFn: async () => {
      const { data, error } = await topsportsClient
        .from('hero_content')
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
      if (heroContent?.id) {
        const { error } = await topsportsClient
          .from('hero_content')
          .update(data)
          .eq('id', heroContent.id);
        if (error) throw error;
      } else {
        const { error } = await topsportsClient
          .from('hero_content')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topsports-hero-content'] });
      toast({ title: "Hero content updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update hero content", variant: "destructive" });
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
        <CardTitle>Landing Page Hero Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Hero Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter hero title"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Hero Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter hero description"
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

export default TopSportsHeroEditor;
