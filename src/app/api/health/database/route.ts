import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check general connectivity
    const { data: pingData, error: pingError } = await supabase.from('profiles').select('id').limit(1);
    
    // Check pgvector specifically
    const { error: vectorError } = await supabase.rpc('match_document_chunks', {
      query_embedding: new Array(768).fill(0),
      query_text: "test",
      match_count: 1
    });

    const isConnected = !pingError;
    const isPgVectorEnabled = !vectorError || !vectorError.message.includes('function match_document_chunks does not exist');

    return NextResponse.json({ 
      status: isConnected && isPgVectorEnabled ? "healthy" : "unhealthy",
      database_connected: isConnected,
      pgvector_rpc_found: isPgVectorEnabled,
      errors: {
        ping: pingError?.message,
        vector: vectorError?.message
      }
    }, { status: isConnected && isPgVectorEnabled ? 200 : 500 });

  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
