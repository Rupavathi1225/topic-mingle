import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lezwczbwcavyuxpozcnm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlendjemJ3Y2F2eXV4cG96Y25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTYzNDEsImV4cCI6MjA3ODkzMjM0MX0.wR2kS_L0qEg5ynGIjAjNnN8vfI4tf4GzQxQVg3uylnQ';

export const topUniversityTerritianClient = createClient(supabaseUrl, supabaseAnonKey);
