'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, PlusCircle } from 'lucide-react'

interface EmptyStateProps {
  searchTerm: string
  selectedTags: string[]
  onCreatePrompt: () => void
}

export default function EmptyState({ 
  searchTerm, 
  selectedTags, 
  onCreatePrompt 
}: EmptyStateProps) {
  return (
    <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-12">
      <CardContent>
        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No prompts found</h3>
        <p className="text-slate-400 mb-4">
          {searchTerm || selectedTags.length > 0 
            ? 'Try adjusting your search or filters' 
            : 'Create your first prompt to get started'
          }
        </p>
        <Button 
          onClick={onCreatePrompt}
          className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
        >
          <PlusCircle size={16} className="mr-2" />
          Create New Prompt
        </Button>
      </CardContent>
    </Card>
  )
}
