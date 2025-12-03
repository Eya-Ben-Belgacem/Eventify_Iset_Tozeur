import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://upjqonccakmeakbzjbfr.supabase.co',  // remplace par ton URL Supabase
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwanFvbmNjYWttZWFrYnpqYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDA3OTUsImV4cCI6MjA4MDI3Njc5NX0.vscDfOqvmqrngNh-tvj4_Sio-3nohFlxTXvxHhfeQXQ'         // remplace par ta clé publique
);
