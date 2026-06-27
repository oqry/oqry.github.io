/* ============================================================
   Society of Inquiry
   Established circa 1847
   supabase.js — database connection
   ============================================================ */

const SUPABASE_URL = 'https://akcdprwiqqkuvedrabjt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrY2RwcndpcXFrdXZlZHJhYmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjE0ODgsImV4cCI6MjA5ODA5NzQ4OH0.gC8fiats4RHcUfugqhJzXUpk1eRe_hCzmgaSdoMKnyc';

// Load Supabase client from CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
