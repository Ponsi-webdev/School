/* Copy to config.js when connecting Supabase. Never put a service-role or secret key in browser code.
   The anon (publishable) key is designed to be public; the database rules protect the data. */
window.SS_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-PUBLIC-ANON-KEY"
};
