import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// To jest nasz "kurier", który będzie latał do bazy danych
export const supabase = createClient(supabaseUrl, supabaseAnonKey);