import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lyakcydzylvxzslrehpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5YWtjeWR6eWx2eHpzbHJlaHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mjk3NjMsImV4cCI6MjA3ODAwNTc2M30.nt00-VWdjKKGeJa_Dkt-DMXfZK9rbRMpMHVFRLnE7Hs';

export const topsportsClient = createClient(supabaseUrl, supabaseAnonKey);
