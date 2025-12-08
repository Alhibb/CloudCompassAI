'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExplainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explanation: string;
  isLoading: boolean;
}

export function ExplainModal({ open, onOpenChange, explanation, isLoading }: ExplainModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white"
        style={{
          boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            Project Brief
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
                <div 
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: 'rgb(139 92 246 / 0.3)' }}
                />
              </div>
              <p className="text-slate-400 text-sm">Analyzing architectural decisions...</p>
            </div>
          ) : (
            <div 
              className="bg-slate-950/50 border border-slate-800 rounded-lg p-6 max-h-[500px] overflow-auto prose prose-invert prose-sm max-w-none"
              style={{
                boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.05)',
              }}
            >
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-white mt-0 mb-4 pb-2 border-b border-slate-800">
                      {children}
                    </h2>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-violet-400 font-semibold">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 my-3 list-none pl-0">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-slate-300">
                      <span className="text-violet-400 mt-1">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-300 leading-relaxed my-3">{children}</p>
                  ),
                }}
              >
                {explanation}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
