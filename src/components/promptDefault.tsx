'use client'

import { 
  Edit,
} from 'lucide-react'

export default function PromptDefault() {

  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center">
                <Edit className="h-8 w-8 text-[var(--moonlight-silver)]" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-[var(--glow-ember)] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">+</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">
              Ready to write?
            </h3>
            <p className="text-[var(--moonlight-silver)]/80 max-w-sm mb-4">
              Select a prompt from the sidebar to start editing, or create a new one to capture your ideas.
            </p>
            <div className="text-xs text-[var(--moonlight-silver)]/60 space-y-1">
              <p>💡 Click any prompt to start editing</p>
              <p>⌘ + S to save changes</p>
              <p>Esc to cancel editing</p>
            </div>
          </div>
        </div>
    </div>
  )
}
