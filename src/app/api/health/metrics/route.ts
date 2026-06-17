import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch average latencies
    const { data, error } = await supabase
      .from('observability_metrics')
      .select('embedding_latency, retrieval_latency, generation_latency, total_latency')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No metrics available yet" });
    }

    const averages = data.reduce((acc, curr) => {
      acc.embedding_latency += curr.embedding_latency || 0;
      acc.retrieval_latency += curr.retrieval_latency || 0;
      acc.generation_latency += curr.generation_latency || 0;
      acc.total_latency += curr.total_latency || 0;
      return acc;
    }, { embedding_latency: 0, retrieval_latency: 0, generation_latency: 0, total_latency: 0 });

    Object.keys(averages).forEach((key) => {
      averages[key as keyof typeof averages] /= data.length;
    });

    return NextResponse.json({ 
      status: "healthy",
      samples: data.length,
      averages,
      recent: data[0]
    });

  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
