'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function GenerateModal({ open, onOpenChange, onGenerate, isLoading }: GenerateModalProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl max-w-2xl">
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            boxShadow: 'inset 0 1px 0 0 rgb(148 163 184 / 0.1)',
          }}
        />
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Generate AWS Architecture
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Describe your architecture
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A serverless web application with API Gateway, Lambda functions, DynamoDB for data storage, and S3 for static assets..."
              className="w-full h-40 px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-slate-700 bg-transparent hover:bg-slate-800/50 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Architecture...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Build It
                </>
              )}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
              </div>
              <p className="text-slate-300 font-medium">Building Architecture...</p>
              <p className="text-slate-500 text-sm">AI is designing your infrastructure</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
