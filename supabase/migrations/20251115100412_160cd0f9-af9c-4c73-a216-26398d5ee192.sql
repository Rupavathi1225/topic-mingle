-- Add RLS policies to allow admin operations on blogs table
CREATE POLICY "Public can insert blogs"
ON public.blogs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update blogs"
ON public.blogs
FOR UPDATE
USING (true);

CREATE POLICY "Public can delete blogs"
ON public.blogs
FOR DELETE
USING (true);

-- Add RLS policies for related_searches table
CREATE POLICY "Public can insert related searches"
ON public.related_searches
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update related searches"
ON public.related_searches
FOR UPDATE
USING (true);

CREATE POLICY "Public can delete related searches"
ON public.related_searches
FOR DELETE
USING (true);

-- Add RLS policies for pre_landing_pages table
CREATE POLICY "Public can insert pre-landing pages"
ON public.pre_landing_pages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update pre-landing pages"
ON public.pre_landing_pages
FOR UPDATE
USING (true);

CREATE POLICY "Public can delete pre-landing pages"
ON public.pre_landing_pages
FOR DELETE
USING (true);

-- Add RLS policies for categories table
CREATE POLICY "Public can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update categories"
ON public.categories
FOR UPDATE
USING (true);

CREATE POLICY "Public can delete categories"
ON public.categories
FOR DELETE
USING (true);