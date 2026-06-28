const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: docs } = await supabase.from('documents').select('*');
  console.log("Documents:", docs);
  const { data: chunks } = await supabase.from('document_chunks').select('id, document_id, workspace_id').limit(10);
  console.log("Chunks count (up to 10):", chunks ? chunks.length : 0);
  
  const { data: jobs } = await supabase.from('ingestion_jobs').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Ingestion Jobs:", jobs);
}
run();
