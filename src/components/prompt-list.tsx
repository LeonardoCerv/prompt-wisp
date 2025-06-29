"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, PlusCircle, Loader2 } from "lucide-react"
import { useApp } from "@/contexts/appContext"
import { PromptActions } from "./prompt-actions"

import PromptCard from "@/components/prompt-card"
import { useRouter } from "next/navigation"
import type { PromptData } from "@/lib/models"
import { useMemo } from "react"

interface PromptListProps {
  onCreatePrompt: () => void
}

export function PromptList({ onCreatePrompt }: PromptListProps) {
  const router = useRouter()
  const { state, actions, utils } = useApp()
  const { user } = state
  const { selectedFilter, selectedCollection, selectedTags } = state.filters
  const { selectedPrompt } = state.ui

  // Get filtered prompts using the context utility
  const { filteredPrompts, totalCount, isLoading } = useMemo(() => {
    const filtered = utils.getFilteredPrompts(selectedFilter, selectedCollection, selectedTags)
    return {
      filteredPrompts: filtered,
      totalCount: filtered.length,
      isLoading: state.loading.prompts || state.loading.relationships,
    }
  }, [utils, selectedFilter, selectedCollection, selectedTags, state.loading.prompts, state.loading.relationships])

  const handlePromptSelect = (prompt: PromptData) => {
    actions.setSelectedPrompt(prompt)
    router.push(`/prompt/${prompt.id}`)
  }

  // Don't render the prompt list on home page
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

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--wisp-blue)]" />
              <span className="ml-2 text-sm text-[var(--moonlight-silver)]">Loading prompts...</span>
            </div>
          ) : !user ? (
            /* Not authenticated */
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-8">
              <CardContent>
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Please log in</h3>
                <p className="text-xs text-slate-400">You need to be logged in to view prompts.</p>
              </CardContent>
            </Card>
          ) : !Array.isArray(filteredPrompts) || filteredPrompts.length === 0 ? (
            /* No prompts found */
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-8">
              <CardContent>
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300 mb-2">
                  {selectedFilter === "collection" && selectedCollection
                    ? "No prompts in this collection"
                    : selectedFilter === "favorites"
                      ? "No favorite prompts"
                      : selectedFilter === "owned"
                        ? "No owned prompts"
                        : selectedFilter === "saved"
                          ? "No saved prompts"
                          : selectedFilter === "deleted"
                            ? "No deleted prompts"
                            : selectedTags.length > 0
                              ? "No prompts with selected tags"
                              : "No prompts found"}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {selectedFilter === "collection" && selectedCollection
                    ? "This collection doesn't have any prompts yet."
                    : selectedFilter === "favorites"
                      ? "You haven't favorited any prompts yet."
                      : selectedFilter === "owned"
                        ? "You haven't created any prompts yet."
                        : selectedFilter === "saved"
                          ? "You haven't saved any prompts yet."
                          : selectedFilter === "deleted"
                            ? "You don't have any deleted prompts."
                            : selectedTags.length > 0
                              ? "Try removing some tag filters or create a new prompt."
                              : "Get started by creating your first prompt."}
                </p>
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
            /* Render prompts */
            <>
              {/* Show count */}
              <div className="text-xs text-[var(--moonlight-silver)] mb-3 px-2">
                {totalCount} {totalCount === 1 ? "prompt" : "prompts"}
                {selectedTags.length > 0 && (
                  <span className="ml-1">with {selectedTags.map((tag) => `#${tag}`).join(", ")}</span>
                )}
              </div>

              {/* Render prompt cards */}
              {filteredPrompts.map((prompt, index) => {
                const isSelected = selectedPrompt?.id === prompt.id
                const isLast = index === filteredPrompts.length - 1
                const isBeforeSelected =
                  index < filteredPrompts.length - 1 && filteredPrompts[index + 1]?.id === selectedPrompt?.id

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
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
