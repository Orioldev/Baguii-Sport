import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cliente dedicado exclusivamente al almacenamiento optimizado de calzados
export const supabase = createClient(supabaseUrl, supabaseAnonKey);