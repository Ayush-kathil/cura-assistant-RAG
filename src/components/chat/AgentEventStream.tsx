'use client';

import React from 'react';
import { Loader2, CheckCircle2, Search, FileText, BrainCircuit, ShieldCheck } from 'lucide-react';

export type AgentStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentStep {
  id: string;
  name: string;
  status: AgentStepStatus;
  message: string;
}

const getIconForStep = (name: string, status: AgentStepStatus) => {
  if (status === 'running') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  
  if (name.includes('Query')) return <BrainCircuit className="w-4 h-4 text-gray-400" />;
  if (name.includes('Search') || name.includes('Retrieve')) return <Search className="w-4 h-4 text-gray-400" />;
  if (name.includes('Extract') || name.includes('Rerank')) return <FileText className="w-4 h-4 text-gray-400" />;
  if (name.includes('Verify')) return <ShieldCheck className="w-4 h-4 text-gray-400" />;
  
  return <div className="w-4 h-4 rounded-full border border-gray-300" />;
};

export function AgentEventStream({ steps }: { steps: AgentStep[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-4 text-sm font-mono flex flex-col gap-2">
      <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Agent Execution Trace</h4>
      {steps.map(step => (
        <div key={step.id} className="flex items-center gap-3">
          {getIconForStep(step.name, step.status)}
          <span className={`
            ${step.status === 'running' ? 'text-blue-700 animate-pulse' : ''}
            ${step.status === 'completed' ? 'text-slate-700' : ''}
            ${step.status === 'pending' ? 'text-slate-400' : ''}
            ${step.status === 'failed' ? 'text-red-600' : ''}
          `}>
            {step.message}
          </span>
        </div>
      ))}
    </div>
  );
}
