import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const AdminPreLanding = () => {
  const [relatedSearches, setRelatedSearches] = useState<any[]>([]);
  const [selectedSearchId, setSelectedSearchId] = useState("");
  const [preLanding, setPreLanding] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    logo_url: "",
    main_image_url: "",
    headline: "",
    description: "",
    email_placeholder: "Enter your email",
    cta_text: "Get Started",
    background_color: "#ffffff",
    background_image_url: ""
  });

  useEffect(() => {
    fetchRelatedSearches();
  }, []);

  useEffect(() => {
    if (selectedSearchId) {
      fetchPreLanding();
    } else {
      setPreLanding(null);
      resetForm();
    }
  }, [selectedSearchId]);

  const fetchRelatedSearches = async () => {
    const { data } = await supabase
      .from('related_searches')
      .select('*, blogs(title, serial_number)')
      .order('created_at', { ascending: false });
    if (data) setRelatedSearches(data);
  };

  const fetchPreLanding = async () => {
    const { data } = await supabase
      .from('pre_landing_pages')
      .select('*')
      .eq('related_search_id', selectedSearchId)
      .maybeSingle();

    if (data) {
      setPreLanding(data);
      setFormData({
        logo_url: data.logo_url || "",
        main_image_url: data.main_image_url || "",
        headline: data.headline || "",
        description: data.description || "",
        email_placeholder: data.email_placeholder || "Enter your email",
        cta_text: data.cta_text || "Get Started",
        background_color: data.background_color || "#ffffff",
        background_image_url: data.background_image_url || ""
      });
    } else {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSearchId) {
      toast.error("Please select a related search");
      return;
    }

    if (preLanding) {
      const { error } = await supabase
        .from('pre_landing_pages')
        .update(formData)
        .eq('id', preLanding.id);

      if (error) {
        toast.error("Error updating pre-landing page");
      } else {
        toast.success("Pre-landing page updated successfully");
        fetchPreLanding();
      }
    } else {
      const { error } = await supabase
        .from('pre_landing_pages')
        .insert([{ ...formData, related_search_id: selectedSearchId }]);

      if (error) {
        toast.error("Error creating pre-landing page");
      } else {
        toast.success("Pre-landing page created successfully");
        fetchPreLanding();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      logo_url: "",
      main_image_url: "",
      headline: "",
      description: "",
      email_placeholder: "Enter your email",
      cta_text: "Get Started",
      background_color: "#ffffff",
      background_image_url: ""
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pre-Landing Page Builder</h2>

      <Card>
        <CardHeader>
          <CardTitle>Select Related Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSearchId} onValueChange={setSelectedSearchId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a related search" />
            </SelectTrigger>
            <SelectContent>
              {relatedSearches.map((search) => (
                <SelectItem key={search.id} value={search.id}>
                  [{search.blogs?.serial_number}] {search.search_text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSearchId && (
        <Card>
          <CardHeader>
            <CardTitle>{preLanding ? "Edit" : "Create"} Pre-Landing Page</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Main Image URL</label>
                <Input
                  type="url"
                  value={formData.main_image_url}
                  onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
                  placeholder="https://example.com/hero.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Headline</label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Your Amazing Headline"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe what users will get..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Placeholder</label>
                <Input
                  value={formData.email_placeholder}
                  onChange={(e) => setFormData({ ...formData, email_placeholder: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">CTA Button Text</label>
                <Input
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Background Color</label>
                <Input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Background Image URL (optional)</label>
                <Input
                  type="url"
                  value={formData.background_image_url}
                  onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                  placeholder="https://example.com/background.jpg"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                {preLanding ? "Update" : "Create"} Pre-Landing Page
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPreLanding;
