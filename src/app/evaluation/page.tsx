"use client";

import { useState } from "react";
import { Upload, Play, CheckCircle, XCircle } from "lucide-react";

export default function EvaluationDashboard() {
  const [dataset, setDataset] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("default-workspace");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setDataset(json);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const runEvaluation = async () => {
    if (dataset.length === 0) return;
    setIsEvaluating(true);
    setResults([]);

    try {
      const res = await fetch("/api/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, workspaceId }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error(err);
      alert("Evaluation failed.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const avgFaithfulness = results.length > 0 
    ? (results.reduce((acc, r) => acc + (r.faithfulness || 0), 0) / results.length) * 100 
    : 0;
    
  const avgRecall = results.length > 0 
    ? (results.reduce((acc, r) => acc + (r.recall || 0), 0) / results.length) * 100 
    : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-tighter">RAG Evaluation Framework</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-slate-200 p-6 rounded-xl bg-slate-50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Upload Dataset</h2>
          <input type="file" accept=".json" onChange={handleFileUpload} className="mb-4 w-full text-sm" />
          <p className="text-xs text-slate-400">JSON format: [{`{"query": "...", "expected_chunk_ids": ["..."]}`}]</p>
          <p className="text-sm font-bold mt-2">{dataset.length} queries loaded</p>
        </div>
        
        <div className="border border-slate-200 p-6 rounded-xl bg-slate-50 flex flex-col justify-center items-center">
          <input 
            type="text" 
            value={workspaceId} 
            onChange={e => setWorkspaceId(e.target.value)} 
            placeholder="Workspace ID"
            className="w-full mb-4 px-3 py-2 border rounded text-sm"
          />
          <button 
            onClick={runEvaluation} 
            disabled={isEvaluating || dataset.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 disabled:bg-slate-300 transition-colors"
          >
            {isEvaluating ? <span className="animate-spin text-xl">↻</span> : <Play className="w-5 h-5" />}
            {isEvaluating ? "Running Eval..." : "Run Evaluation Benchmark"}
          </button>
        </div>

        <div className="border border-slate-200 p-6 rounded-xl bg-slate-50 flex justify-around items-center">
          <div className="text-center">
            <p className="text-3xl font-black text-slate-800">{avgFaithfulness.toFixed(1)}%</p>
            <p className="text-xs uppercase font-bold text-slate-500 mt-1">Faithfulness</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-slate-800">{avgRecall.toFixed(1)}%</p>
            <p className="text-xs uppercase font-bold text-slate-500 mt-1">Recall</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((res, i) => (
          <div key={i} className="border border-slate-200 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Q: {res.query}</h3>
            {res.error ? (
              <p className="text-red-500 text-sm">{res.error}</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{res.generation}</p>
                </div>
                <div className="col-span-1 space-y-2 border-l pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-slate-500">Faithfulness</span>
                    {res.faithfulness === 1 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-slate-500">Recall</span>
                    <span className="font-mono text-sm font-bold">{(res.recall * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-slate-500">Latency</span>
                    <span className="font-mono text-sm font-bold">{res.latencyMs}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
