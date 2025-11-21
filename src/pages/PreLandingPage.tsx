import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PreLandingPage = () => {
  const { searchId } = useParams();
  const [preLanding, setPreLanding] = useState<any>(null);
  const [relatedSearch, setRelatedSearch] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreLanding();
  }, [searchId]);

  const fetchPreLanding = async () => {
    try {
      // Fetch related search first
      const { data: rsData, error: rsError } = await supabase
        .from("related_searches")
        .select("*")
        .eq("id", searchId)
        .single();

      if (rsError) {
        console.error("Error fetching related search:", rsError);
        setLoading(false);
        return;
      }

      setRelatedSearch(rsData);

      // Fetch pre-landing page data
      const { data: preLandingData, error: plError } = await supabase
        .from("pre_landing_pages")
        .select("*")
        .eq("related_search_id", searchId)
        .maybeSingle();

      if (plError) {
        console.error("Error fetching pre-landing page:", plError);
      }

      setPreLanding(preLandingData);
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchPreLanding:", error);
      setLoading(false);
    }
  };

  // ⭐⭐⭐ UPDATED: Save email + IP + IDs ⭐⭐⭐
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !relatedSearch) return;

    try {
      // 1️⃣ Get visitor IP
      const ipResponse = await fetch("https://api64.ipify.org?format=json");
      const ipData = await ipResponse.json();

      // 2️⃣ Save to database
      const { error } = await supabase.from("pre_landing_emails").insert({
        email: email,
        related_search_id: searchId,
        pre_landing_page_id: preLanding?.id || null,
        ip_address: ipData.ip,
      });

      if (error) {
        console.error("Email save error:", error);
        toast.error("Failed to save email");
        return;
      }

      // 3️⃣ Success + redirect
      toast.success("Thank you! Redirecting...");
      setTimeout(() => {
        window.location.href = relatedSearch.target_url;
      }, 1500);
    } catch (err) {
      console.error("Error submitting email:", err);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!relatedSearch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  const bgStyle = preLanding?.background_image_url
    ? {
        backgroundImage: `url(${preLanding.background_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: preLanding?.background_color || "#f3f4f6" };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={bgStyle}
    >
      <div className="max-w-2xl w-full bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-8 space-y-8">
        {preLanding?.logo_url && (
          <div className="text-center">
            <img src={preLanding.logo_url} alt="Logo" className="h-16 mx-auto" />
          </div>
        )}

        {preLanding?.main_image_url && (
          <img
            src={preLanding.main_image_url}
            alt="Main"
            className="w-full rounded-lg"
          />
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
          {preLanding?.headline || relatedSearch.search_text}
        </h1>

        {preLanding?.description && (
          <p className="text-center text-muted-foreground text-lg">
            {preLanding.description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder={preLanding?.email_placeholder || "Enter your email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center text-lg py-6"
          />

          <Button type="submit" size="lg" className="w-full text-lg py-6">
            {preLanding?.cta_text || "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PreLandingPage;
