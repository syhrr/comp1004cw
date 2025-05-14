import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://oxinpfpbpvsglksvpnug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aW5wZnBicHZzZ2xrc3ZwbnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTI1MTgsImV4cCI6MjA1OTA4ODUxOH0.MpFlhTkVXe8nqunU_87cZbf8MQdg8ogJqBbRbU0nIxI';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
