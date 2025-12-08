'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Node } from '@xyflow/react';
import { AWSNodeData } from '@/components/AWSNode';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CostBreakdown {
  service: string;
  cost: number;
}

interface CostBadgeProps {
  nodes: Node<AWSNodeData>[];
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => current.toFixed(2));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function CostBadge({ nodes }: CostBadgeProps) {
  const [totalCost, setTotalCost] = useState(0);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastNodeCount, setLastNodeCount] = useState(0);

  const fetchCost = useCallback(async () => {
    if (nodes.length === 0) {
      setTotalCost(0);
      setBreakdown([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes }),
      });

      if (response.ok) {
        const data = await response.json();
        setTotalCost(data.totalCost || 0);
        setBreakdown(data.breakdown || []);
      }
    } catch (error) {
      console.error('Failed to fetch cost:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nodes]);

  // Fetch cost when nodes change
  useEffect(() => {
    if (nodes.length !== lastNodeCount) {
      setLastNodeCount(nodes.length);
      fetchCost();
    }
  }, [nodes.length, lastNodeCount, fetchCost]);

  // Initial fetch
  useEffect(() => {
    fetchCost();
  }, []);

  const handleRefresh = () => {
    fetchCost();
  };

  return (
    <TooltipProvider>
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
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-0.5">Estimated Monthly Cost</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xl font-bold text-white font-mono cursor-help">
                  $<AnimatedNumber value={totalCost} />
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-slate-900 border-slate-700 p-3 max-w-xs"
              >
                {breakdown.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Cost Breakdown</p>
                    {breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-slate-400">{item.service}:</span>
                        <span className="text-emerald-400 font-mono">${item.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No services to estimate</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-200 disabled:opacity-50"
            title="Refresh cost estimate"
          >
            <RefreshCw 
              className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
        {nodes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              {nodes.length} resource{nodes.length !== 1 ? 's' : ''} deployed
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
