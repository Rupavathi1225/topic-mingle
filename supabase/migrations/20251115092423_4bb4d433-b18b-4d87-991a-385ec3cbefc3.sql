-- Create categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code_range_start INTEGER NOT NULL,
  code_range_end INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number INTEGER UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create related searches table
CREATE TABLE public.related_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  search_text TEXT NOT NULL,
  target_url TEXT NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pre-landing pages table
CREATE TABLE public.pre_landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  related_search_id UUID REFERENCES public.related_searches(id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  main_image_url TEXT,
  headline TEXT,
  description TEXT,
  email_placeholder TEXT DEFAULT 'Enter your email',
  cta_text TEXT DEFAULT 'Get Started',
  background_color TEXT DEFAULT '#ffffff',
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics sessions table
CREATE TABLE public.analytics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  country TEXT,
  device TEXT,
  user_agent TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics page views table
CREATE TABLE public.analytics_page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_type TEXT NOT NULL,
  page_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics blog clicks table
CREATE TABLE public.analytics_blog_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics related search clicks table
CREATE TABLE public.analytics_related_search_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  related_search_id UUID REFERENCES public.related_searches(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics visit now clicks table
CREATE TABLE public.analytics_visit_now_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  related_search_id UUID REFERENCES public.related_searches(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_blog_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_related_search_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visit_now_clicks ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view published categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view related searches" ON public.related_searches FOR SELECT USING (true);
CREATE POLICY "Public can view pre-landing pages" ON public.pre_landing_pages FOR SELECT USING (true);

-- Analytics write policies (public can insert tracking data)
CREATE POLICY "Public can insert sessions" ON public.analytics_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert page views" ON public.analytics_page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert blog clicks" ON public.analytics_blog_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert related search clicks" ON public.analytics_related_search_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert visit now clicks" ON public.analytics_visit_now_clicks FOR INSERT WITH CHECK (true);

-- Public can read analytics (for now - you may want to restrict this)
CREATE POLICY "Public can view analytics sessions" ON public.analytics_sessions FOR SELECT USING (true);
CREATE POLICY "Public can view page views" ON public.analytics_page_views FOR SELECT USING (true);
CREATE POLICY "Public can view blog clicks" ON public.analytics_blog_clicks FOR SELECT USING (true);
CREATE POLICY "Public can view related search clicks" ON public.analytics_related_search_clicks FOR SELECT USING (true);
CREATE POLICY "Public can view visit now clicks" ON public.analytics_visit_now_clicks FOR SELECT USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pre_landing_pages_updated_at BEFORE UPDATE ON public.pre_landing_pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, slug, code_range_start, code_range_end) VALUES
('Finance', 'finance', 100, 200),
('Education', 'education', 201, 300),
('Health', 'health', 401, 500),
('Lifestyle', 'lifestyle', 601, 700),
('Wellness', 'wellness', 701, 800),
('Deals', 'deals', 801, 900),
('Job Seeking', 'job-seeking', 901, 1000),
('Alternative Learning', 'alternative-learning', 1001, 1100);