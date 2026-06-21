import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, isPositive } = body;

    if (!query || typeof isPositive !== 'boolean') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const relevance_score = isPositive ? 1.0 : 0.0;

    const { error: dbError } = await supabase.from('rag_evaluations').insert({
      user_id: user.id,
      query: query,
      relevance_score: relevance_score
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
