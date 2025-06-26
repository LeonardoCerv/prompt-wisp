"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import NewCollection from "@/components/newCollection"
import Dialog from "@/components/ui/dialog"
import NewPromptPage from "@/components/newPrompt"
import { Sidebar } from "./sidebar"
import { PromptList } from "./promptList"
import { useApp } from "@/contexts/appContext"

interface NavbarProps {
  children?: React.ReactNode
}

export default function Navbar({ children }: NavbarProps) {
  const router = useRouter()
  const { state, actions } = useApp()
  const { prompts, user } = state

  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateCollection = async (collectionData: any) => {
    try {
      const requestBody = {
        title: collectionData.title.trim(),
        description: collectionData.description.trim() || null,
        tags: collectionData.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        visibility: collectionData.visibility,
        images: collectionData.images.length > 0 ? collectionData.images : null,
        collaborators:
          collectionData.collaborators.length > 0 ? collectionData.collaborators.map((c: any) => c.id) : null,
        prompts: collectionData.prompts.length > 0 ? collectionData.prompts.map((p: any) => p.id) : [],
        user_id: user?.id,
      }

      console.log("Creating collection with data:", requestBody)

      const newCollection = await actions.createCollection(requestBody)

      toast.success("Collection created successfully")
      setIsNewCollectionOpen(false)
      // Automatically switch to the new collection view
      actions.setFilter("collection", { collection: newCollection.id })

      console.log("Collection created and filter set:", newCollection.id)
    } catch (error) {
      console.error("Error creating collection:", error)
      toast.error("Failed to create collection")
    }
  }

  const handleCreatePrompt = async (promptData: any) => {
    try {
      const transformedPrompt = {
        title: promptData.title,
        description: promptData.description,
        tags: promptData.tags,
        content: promptData.content,
        visibility: promptData.visibility,
        images: promptData.images,
        collaborators: promptData.collaborators.map((user: any) => user.id),
        collections: promptData.collections.map((collection: any) => collection),
      }

      const newPrompt = await actions.createPrompt(transformedPrompt)
      toast.success("Prompt created successfully")
      setShowCreateDialog(false)
      router.push(`/prompt/${newPrompt.id}`)
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast.error("Failed to create prompt")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-screen">
        <div className="flex gap-0 h-full">
          {/* Left Column - Filters */}
          <div className="w-[240px] max-w-[240px] flex-shrink-0">
            <Sidebar onCreateCollection={() => setIsNewCollectionOpen(true)} />
          </div>

          {/* Center Column - Prompt List */}
          <PromptList onCreatePrompt={() => setShowCreateDialog(true)} />

          {/* Right Column - Main Content */}
          <div className="flex-1 h-full">{children}</div>
        </div>
      </div>

      {/* New Collection Dialog */}
      <NewCollection
        open={isNewCollectionOpen}
        onOpenChange={setIsNewCollectionOpen}
        onSubmit={handleCreateCollection}
        availablePrompts={prompts
          .filter((p) => !p.deleted)
          .map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description || undefined,
            content: p.content,
            tags: p.tags,
          }))}
      />

      {/* Create Prompt Dialog */}
      <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="" maxWidth="max-w-3xl">
        <NewPromptPage onSubmit={handleCreatePrompt} onCancel={() => setShowCreateDialog(false)} />
      </Dialog>
    </div>
  )
}
