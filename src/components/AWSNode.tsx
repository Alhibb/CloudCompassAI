'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface AWSNodeData extends Record<string, unknown> {
  label: string;
  icon: string;
  color: string;
  category: string;
}

export type AWSNode = Node<AWSNodeData>;

function AWSNodeComponent({ data, selected }: NodeProps<AWSNode>) {
  const IconComponent = (Icons[data.icon as keyof typeof Icons] as LucideIcon) || Icons.Box;

  return (
    <div
      className={`min-w-[200px] bg-slate-900/60 backdrop-blur-xl border rounded-xl overflow-hidden transition-all duration-300 ${
        selected ? 'ring-2 ring-offset-2 ring-offset-slate-950' : ''
      }`}
      style={{
        borderColor: selected ? data.color : '#1e293b',
        boxShadow: selected
          ? `0 0 30px ${data.color}60, 0 0 60px ${data.color}30, inset 0 1px 0 0 rgb(148 163 184 / 0.1)`
          : `0 0 20px ${data.color}25, 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgb(148 163 184 / 0.1)`,
        '--tw-ring-color': data.color,
      } as React.CSSProperties}
    >
      {/* Top accent bar */}
      <div
        className="h-1"
        style={{
          backgroundColor: data.color,
          boxShadow: `0 0 10px ${data.color}80`,
        }}
      />
      
      {/* Node content */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2 rounded-md"
            style={{
              backgroundColor: `${data.color}20`,
            }}
          >
            <IconComponent
              className="w-5 h-5"
              style={{ color: data.color }}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{data.label}</h3>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{data.category}</p>
          </div>
        </div>
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-slate-700 !border-2 !border-slate-500"
        style={{
          left: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-slate-700 !border-2 !border-slate-500"
        style={{
          right: -6,
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-slate-700 !border-2 !border-slate-500"
        style={{
          top: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-slate-700 !border-2 !border-slate-500"
        style={{
          bottom: -6,
        }}
      />
    </div>
  );
}

export const AWSNode = memo(AWSNodeComponent);
