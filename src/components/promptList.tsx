"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, PlusCircle } from "lucide-react"
import { useApp } from "@/contexts/appContext"
import { useFilteredPrompts } from "@/hooks/useFilteredPrompts"
import { PromptActions } from "./promptActions"

import PromptCard from "@/components/promptCard"
import { useRouter } from "next/navigation"
import { PromptData } from "@/lib/models"

interface PromptListProps {
  onCreatePrompt: () => void
}

export function PromptList({ onCreatePrompt }: PromptListProps) {
  const router = useRouter()
  const { state, actions } = useApp()
  const { prompts, user } = state
  const { selectedFilter, selectedCollection, selectedTags } = state.filters
  const { selectedPrompt } = state.ui

  const filteredPrompts = useFilteredPrompts({
    prompts,
    user,
    selectedFilter,
    selectedCollection,
    selectedTags,
  })

  const displayPrompts = selectedFilter === "home" ? prompts : filteredPrompts

  const handlePromptSelect = (prompt: PromptData) => {
    actions.setSelectedPrompt(prompt)
    router.push(`/prompt/${prompt.id}`)
  }

  if (selectedFilter === "home") {
    return null
  }

  return (
    <div className="h-full flex-col w-[300px] flex">
      <div className="flex flex-col bg-[var(--blackblack)] p-0 h-screen">
        <PromptActions />

        <div className="flex-1 overflow-y-auto px-3">
          <Button
            variant="ghost"
            onClick={onCreatePrompt}
            className="w-full gap-3 mb-3 py-6 text-sm text-[var(--wisp-blue)] rounded-lg hover:bg-[var(--wisp-blue)]/20 hover:text-[var(--wisp-blue)] border border-dashed border-[var(--wisp-blue)]/40"
            title="Create new prompt"
          >
              <Plus size={14} className="flex-shrink-0" />
            <span className="truncate">Create new prompt</span>
          </Button>

          {prompts.length === 0 ? (
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-8">
              <CardContent>
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300 mb-2">No prompts found</h3>
                <Button
                  onClick={onCreatePrompt}
                  size="sm"
                  className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                >
                  <PlusCircle size={14} className="mr-2" />
                  Create New Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            displayPrompts.map((prompt, index) => {
              const isSelected = selectedPrompt?.id === prompt.id
              const isLast = index === displayPrompts.length - 1
              const isBeforeSelected =
                index < displayPrompts.length - 1 && displayPrompts[index + 1]?.id === selectedPrompt?.id

              return (
                <div key={prompt.id}>
                  <PromptCard
                    prompt={prompt}
                    isSelected={isSelected}
                    isLast={isLast}
                    isBeforeSelected={isBeforeSelected}
                    onSelect={() => handlePromptSelect(prompt)}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
