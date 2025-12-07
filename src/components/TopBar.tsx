'use client';

import { Sparkles, Download, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  onGenerate: () => void;
  onExport: () => void;
  onDownloadImage?: () => void;
  isExporting?: boolean;
}

export function TopBar({ onGenerate, onExport, onDownloadImage, isExporting }: TopBarProps) {
  return (
    <div className="fixed top-0 left-[280px] right-0 h-[72px] bg-slate-900/40 backdrop-blur-xl border-b border-slate-800 px-8 flex items-center justify-between z-50">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.1)',
        }}
      />
      <div className="relative z-10 flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span
            className="inline-block"
            style={{
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
            }}
          >
            CloudCompass AI
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={onGenerate}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 active:scale-[0.98]"
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate
          </Button>
          {onDownloadImage && (
            <Button
              onClick={onDownloadImage}
              variant="outline"
              className="border-slate-700 bg-transparent hover:bg-slate-800/50 text-slate-200 font-medium px-4 py-2 rounded-lg transition-all duration-200 active:scale-[0.98] hover:border-slate-600"
            >
              <Image className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          )}
          <Button
            onClick={onExport}
            variant="outline"
            disabled={isExporting}
            className="border-slate-700 bg-transparent hover:bg-slate-800/50 text-slate-200 font-medium px-6 py-2 rounded-lg transition-all duration-200 active:scale-[0.98] hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)',
            }}
            onMouseEnter={(e) => {
              if (!isExporting) {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 0 rgba(139, 92, 246, 0)';
            }}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Terraform
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
