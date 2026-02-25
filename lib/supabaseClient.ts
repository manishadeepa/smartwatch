import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://douzspgmkxatkuydpvja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdXpzcGdta3hhdGt1eWRwdmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjA1OTAsImV4cCI6MjA4NzU5NjU5MH0.WASrI3KaBkjoGwqdW9fnGSkXBsOczaWbp273m-heWhk"
);