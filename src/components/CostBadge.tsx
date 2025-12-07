'use client';

import { DollarSign } from 'lucide-react';

interface CostBadgeProps {
  nodeCount: number;
}

export function CostBadge({ nodeCount }: CostBadgeProps) {
  // Calculate fake cost based on node count
  const baseCost = 5.0;
  const costPerNode = 12.5;
  const totalCost = baseCost + (nodeCount * costPerNode);

  return (
    <div
      className="fixed bottom-6 left-[304px] z-30 px-4 py-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl"
      style={{
        boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.1), 0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Estimated Monthly Cost</p>
          <p className="text-xl font-bold text-white font-mono">
            ${totalCost.toFixed(2)}
            <span className="text-sm font-normal text-slate-400">/mo</span>
          </p>
        </div>
      </div>
      {nodeCount > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            {nodeCount} resource{nodeCount !== 1 ? 's' : ''} deployed
          </p>
        </div>
      )}
    </div>
  );
}
