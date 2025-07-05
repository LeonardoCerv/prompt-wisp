"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useApp } from "@/contexts/appContext"

import PromptCard from "@/components/prompt-card"
import { useRouter } from "next/navigation"
import { CollectionPrompts, type PromptData } from "@/lib/models"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"

export function PromptList() {
  const router = useRouter()
  const { state, actions, utils } = useApp()
  const { user } = state
  const { selectedFilter, selectedCollection, selectedTags } = state.filters
  const { selectedPrompt } = state.ui
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([])

  // Load filtered prompts when filters change
  useEffect(() => {
    async function loadFilteredPrompts() {
      try {
        const filtered = await utils.getFilteredPrompts(selectedFilter, selectedCollection, selectedTags)
        setFilteredPrompts(filtered)
      } catch (error) {
        console.error("Error loading filtered prompts:", error)
        setFilteredPrompts([])
      }
    }
    
    loadFilteredPrompts()
  }, [utils, selectedFilter, selectedCollection, selectedTags])

  const handleCreatePrompt = async () => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated")
        return
      }

      const createPromptData = {
        title: undefined,
        description: undefined,
        tags: [],
        visibility: undefined,
        images: [],
        content: undefined,
      }

      const newPrompt = await actions.createPrompt(createPromptData)
      toast.success(
        `Prompt created successfully`
      )
      
      if (selectedCollection) {
        await CollectionPrompts.create({ prompt_id: newPrompt.id, collection_id: selectedCollection })
        await actions.loadUserRelationships()
      }
      
      actions.setSelectedPrompt(newPrompt)
      router.push(`/prompt/${newPrompt.id}`)
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast.error("Failed to create prompt")
    }
  }

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
        <div className="pt-4">

        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <Button
            variant="ghost"
            onClick={() => handleCreatePrompt()}
            className="w-full gap-3 mb-3 py-6 text-sm text-[var(--wisp-blue)] rounded-lg hover:bg-[var(--wisp-blue)]/20 hover:text-[var(--wisp-blue)] border border-dashed border-[var(--wisp-blue)]/40"
            title="Create new prompt"
          >
            <Plus size={14} className="flex-shrink-0" />
            <span className="truncate">Create new prompt</span>
          </Button>

          {/* Loading state */}
          {filteredPrompts.length === 0 ? (
            /* No prompts found */
            <Card className="bg-transparent border-transparent text-center py-8">
              <CardContent className="flex flex-col items-center justify-center">
                <Image                         
                  src="/wisp.svg" 
                  alt="Wisp Mascot" 
                  width={80} 
                  height={80} 
                />
                <p className="mt-4"> 
                  <span className="text-sm font-semibold text-slate-300">No prompts found</span>
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Render prompts */
            <>
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
