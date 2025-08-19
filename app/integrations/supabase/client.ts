import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://lmhkdyuebheeaqelfxds.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtaGtkeXVlYmhlZWFxZWxmeGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjM3NzQsImV4cCI6MjA3MTE5OTc3NH0.kU5RJkSNZhx0-6YGGxnL7Aa9dL7fXK_BO1aaBlqv2qM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
