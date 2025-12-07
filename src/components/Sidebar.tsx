'use client';

import { AWS_SERVICES } from '@/types/aws-services';
import { ServiceTile } from './ServiceTile';
import { AWSService } from '@/types/aws-services';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, service: AWSService) => void;
}

export function Sidebar({ onDragStart }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-[280px] bg-slate-900/40 backdrop-blur-xl border-r border-slate-800 p-6 overflow-y-auto">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.1)',
        }}
      />
      <div className="relative z-10">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-6">
          AWS Components
        </h2>
        <div className="space-y-4">
          {AWS_SERVICES.map((service) => (
            <ServiceTile
              key={service.id}
              service={service}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
