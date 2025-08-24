'use client';

import { useState } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExtensionBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="text-white px-4 py-3 relative z-[9999]" style={{ backgroundColor: 'var(--wisp-blue)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Download className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-medium text-sm sm:text-base">
              Get the Prompt Wisp Browser Extension
            </span>
            <span className="text-white/80 text-xs sm:text-sm">
              Save prompts directly from any website with one click
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.open('https://chromewebstore.google.com/detail/prompt-wisp/jfnnlgpcdjjfkhlngolanneflbgpekeo', '_blank')}
            size="sm"
            variant="secondary"
            className="bg-white text-[var(--wisp-blue)] hover:bg-white/90 border-0 font-medium text-xs sm:text-sm px-3 py-1.5"
          >
            <span className="hidden sm:inline">Install Extension</span>
            <span className="sm:hidden">Install</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
          <Button
            onClick={() => setVisible(false)}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 p-1"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
