import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nfmfejumgxlhftnohefy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbWZlanVtZ3hsaGZ0bm9oZWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDM1MDEsImV4cCI6MjA2MjMxOTUwMX0.O3Hm1EBTjnUArZmI_Lu12G7wbwHY8EFDsY_O9SBSrUo';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 