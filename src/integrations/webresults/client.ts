import { createClient } from '@supabase/supabase-js';

const WEBRESULTS_URL = "https://svsrtuvekdvgfaadmtzj.supabase.co";
const WEBRESULTS_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2c3J0dXZla2R2Z2ZhYWRtdHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTU4NDQsImV4cCI6MjA3ODA3MTg0NH0.-2ME_szojgBgIJuPutxQVeopX9lLRWaPbJZsEvZ0IF0";

export const webResultsClient = createClient(WEBRESULTS_URL, WEBRESULTS_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
