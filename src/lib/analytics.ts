import { supabase } from "@/integrations/supabase/client";

// Get or create session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get device type
export const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

// Get country (using approximate IP-based detection)
export const getCountry = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'WW';
  } catch (error) {
    return 'WW';
  }
};

// Initialize analytics session
export const initAnalyticsSession = async (source?: string) => {
  const sessionId = getSessionId();
  const device = getDeviceType();
  const country = await getCountry();
  const userAgent = navigator.userAgent;

  // Check if session already exists
  const { data: existing } = await supabase
    .from('analytics_sessions')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from('analytics_sessions')
      .insert({
        session_id: sessionId,
        ip_address: 'hidden', // IP is hidden for privacy
        country,
        device,
        user_agent: userAgent,
        source: source || 'direct'
      });

    if (error) console.error('Analytics session error:', error);
  }
};

// Track page view
export const trackPageView = async (pageType: string, pageId?: string | number) => {
  const sessionId = getSessionId();
  
  const { error } = await supabase
    .from('analytics_page_views')
    .insert({
      session_id: sessionId,
      page_type: pageType,
      page_id: pageId?.toString()
    });

  if (error) console.error('Page view tracking error:', error);
};

// Track blog click
export const trackBlogClick = async (blogId: string) => {
  const sessionId = getSessionId();
  
  const { error } = await supabase
    .from('analytics_blog_clicks')
    .insert({
      session_id: sessionId,
      blog_id: blogId
    });

  if (error) console.error('Blog click tracking error:', error);
};

// Track related search click
export const trackRelatedSearchClick = async (relatedSearchId: string) => {
  const sessionId = getSessionId();
  
  const { error } = await supabase
    .from('analytics_related_search_clicks')
    .insert({
      session_id: sessionId,
      related_search_id: relatedSearchId
    });

  if (error) console.error('Related search click tracking error:', error);
};

// Track visit now click
export const trackVisitNowClick = async (relatedSearchId: string) => {
  const sessionId = getSessionId();
  
  const { error } = await supabase
    .from('analytics_visit_now_clicks')
    .insert({
      session_id: sessionId,
      related_search_id: relatedSearchId
    });

  if (error) console.error('Visit now click tracking error:', error);
};
