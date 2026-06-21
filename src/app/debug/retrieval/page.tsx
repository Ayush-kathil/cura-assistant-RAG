"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RetrievalDebugPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from("retrieval_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setLogs(data);
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-tighter">Retrieval Observability Traces</h1>
      
      <div className="space-y-8">
        {logs.map((log) => (
          <div key={log.id} className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xl font-semibold">Query: {log.query}</h2>
              <span className="text-sm bg-black text-white px-3 py-1 rounded-full font-mono">{log.latency_ms}ms</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">Retrieved Chunks</h3>
                <ul className="space-y-2 text-sm">
                  {log.retrieved_chunks?.map((chunk: any, i: number) => (
                    <li key={i} className="flex justify-between border-b pb-1">
                      <span className="truncate w-3/4">{chunk.content}</span>
                      <span className="font-mono">{chunk.final_score?.toFixed(3)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">Generation & Verification</h3>
                <p className="text-sm mb-4 line-clamp-3">{log.generation}</p>
                
                <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500">Verification Scores</h4>
                <ul className="text-xs space-y-1 mt-2">
                  {log.verification_result?.map((v: any, i: number) => (
                    <li key={i} className="flex justify-between border-b pb-1">
                      <span className="truncate w-3/4">{v.sentence}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        v.status === 'Verified' ? 'bg-green-100 text-green-800' :
                        v.status === 'Unsupported' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{v.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-500 italic">No retrieval logs found. Run a query in the workspace first.</p>}
      </div>
    </div>
  );
}
