'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terraformCode: string;
}

export function ExportModal({ open, onOpenChange, terraformCode }: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(terraformCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([terraformCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.tf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Export Terraform Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-[500px] overflow-auto">
            <pre className="text-sm text-slate-300 font-mono">
              <code>{terraformCode}</code>
            </pre>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download .tf File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
