'use client';

import { AWSService } from '@/types/aws-services';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ServiceTileProps {
  service: AWSService;
  onDragStart: (event: React.DragEvent, service: AWSService) => void;
}

export function ServiceTile({ service, onDragStart }: ServiceTileProps) {
  const IconComponent = (Icons[service.icon as keyof typeof Icons] as LucideIcon) || Icons.Box;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, service)}
      className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5"
      style={{
        boxShadow: `0 0 0 0 ${service.color}40`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 20px 0 ${service.color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 0 ${service.color}40`;
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-md"
          style={{
            backgroundColor: `${service.color}20`,
          }}
        >
          <IconComponent
            className="w-5 h-5"
            style={{ color: service.color }}
          />
        </div>
        <span className="text-sm font-medium text-slate-200 uppercase tracking-wide">
          {service.name}
        </span>
      </div>
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `inset 0 1px 0 0 rgb(148 163 184 / 0.1)`,
        }}
      />
    </div>
  );
}
