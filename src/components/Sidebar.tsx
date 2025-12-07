'use client';

import { AWS_SERVICES } from '@/types/aws-services';
import { ServiceTile } from './ServiceTile';
import { AWSService } from '@/types/aws-services';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, service: AWSService) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ onDragStart, isOpen, onClose }: SidebarProps) {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 p-6 overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
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
