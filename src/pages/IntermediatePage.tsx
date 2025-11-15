import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { trackVisitNowClick } from "@/lib/analytics";

const IntermediatePage = () => {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const [relatedSearch, setRelatedSearch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedSearch();
  }, [searchId]);

  const fetchRelatedSearch = async () => {
    const { data, error } = await supabase
      .from('related_searches')
      .select('*')
      .eq('id', searchId)
      .single();

    if (error) {
      console.error('Error fetching related search:', error);
    } else {
      setRelatedSearch(data);
    }
    setLoading(false);
  };

  const handleVisitNow = async () => {
    if (relatedSearch) {
      await trackVisitNowClick(relatedSearch.id);
      
      // Check if there's a pre-landing page
      const { data: preLanding } = await supabase
        .from('pre_landing_pages')
        .select('*')
        .eq('related_search_id', relatedSearch.id)
        .maybeSingle();

      if (preLanding) {
        navigate(`/prelanding/${relatedSearch.id}`);
      } else {
        window.location.href = relatedSearch.target_url;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!relatedSearch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Content not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {relatedSearch.search_text}
        </h1>
        <p className="text-lg text-muted-foreground">
          We found some great resources for you. Click the button below to continue.
        </p>
        <Button 
          size="lg"
          onClick={handleVisitNow}
          className="px-12 py-6 text-lg"
        >
          Visit Now
        </Button>
      </div>
    </div>
  );
};

export default IntermediatePage;
