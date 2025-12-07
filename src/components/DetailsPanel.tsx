'use client';

import { useState, useEffect } from 'react';
import { X, Server, MapPin, Activity, Clock, DollarSign, Zap, Database, Table, HardDrive, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AWSNodeData } from './AWSNode';
import { Node } from '@xyflow/react';

interface DetailsPanelProps {
  node: Node<AWSNodeData> | null;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Server,
  Zap,
  Database,
  Table,
  HardDrive,
  Network,
};

// Smart Defaults for each AWS service type
const DEFAULT_SPECS: Record<string, { instanceType: string; memory: string; region: string }> = {
  Lambda: { memory: '128MB', instanceType: 'Serverless', region: 'us-east-1' },
  EC2: { memory: '4GB', instanceType: 't3.medium', region: 'us-east-1' },
  S3: { memory: 'N/A', instanceType: 'Standard', region: 'us-east-1' },
  DynamoDB: { memory: 'N/A', instanceType: 'On-Demand', region: 'us-east-1' },
  RDS: { memory: '2GB', instanceType: 'db.t3.micro', region: 'us-east-1' },
  'API Gateway': { memory: 'N/A', instanceType: 'REST API', region: 'us-east-1' },
};

const getDefaultConfig = (label: string) => {
  return DEFAULT_SPECS[label] || { instanceType: 'Standard', memory: '512MB', region: 'us-east-1' };
};

export function DetailsPanel({ node, onClose }: DetailsPanelProps) {
  const data = node?.data;
  
  const [instanceType, setInstanceType] = useState('');
  const [memory, setMemory] = useState('');
  const [region, setRegion] = useState('');

  // Auto-fill inputs with smart defaults when panel opens or node changes
  useEffect(() => {
    if (data) {
      const defaults = getDefaultConfig(data.label);
      // Use node data if available, otherwise use smart defaults
      setInstanceType(defaults.instanceType);
      setMemory(defaults.memory);
      setRegion(defaults.region);
    }
  }, [data, node?.id]);

  if (!node || !data) return null;

  const IconComponent = iconMap[data.icon] || Server;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-[72px] right-0 bottom-0 w-[400px] bg-slate-900/40 backdrop-blur-xl border-l border-slate-800 z-50 shadow-2xl animate-slide-in-right"
        style={{
          boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.1), -10px 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${data.color}20`,
                border: `1px solid ${data.color}40`,
                boxShadow: `0 0 20px ${data.color}30`,
              }}
            >
              <IconComponent className="w-7 h-7" style={{ color: data.color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{data.label}</h2>
              <p className="text-sm text-slate-400 font-mono">{node.id.slice(0, 20)}...</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-100px)]">
          {/* Live Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Live Status
            </h3>
            <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-base font-medium text-emerald-400">Running</span>
              <span className="ml-auto text-xs text-slate-500">Uptime: 24d 7h</span>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Configuration
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <label className="text-xs text-slate-400">Instance Type</label>
                </div>
                <Input
                  value={instanceType}
                  onChange={(e) => setInstanceType(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white text-sm focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <label className="text-xs text-slate-400">Memory</label>
                </div>
                <Input
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white text-sm focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <label className="text-xs text-slate-400">Region</label>
                </div>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white text-sm focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Estimated Cost</p>
                  <p className="text-sm font-medium text-white font-mono">
                    {data.label === 'EC2' ? '$24.50/mo' :
                     data.label === 'Lambda' ? '$8.20/mo' :
                     data.label === 'S3' ? '$5.00/mo' :
                     data.label === 'DynamoDB' ? '$12.00/mo' :
                     data.label === 'RDS' ? '$35.00/mo' :
                     data.label === 'API Gateway' ? '$3.50/mo' : '$10.00/mo'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Metrics
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">CPU Usage</span>
                  <span className="text-xs font-medium text-white">42%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: '42%' }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Memory Usage</span>
                  <span className="text-xs font-medium text-white">68%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Network I/O</span>
                  <span className="text-xs font-medium text-white">1.2 GB/s</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: '35%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
                Environment: Production
              </span>
              <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
                Team: DevOps
              </span>
              <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
                Project: CloudCompass
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
