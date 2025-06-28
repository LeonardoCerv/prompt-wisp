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
import { CollectionInsert, PromptInsert } from "@/lib/models"

interface NavbarProps {
  children?: React.ReactNode
}

export default function Navbar({ children }: NavbarProps) {
  const router = useRouter()
  const { state, actions } = useApp()
  const {  user } = state

  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const allowedVisibilities = ["public", "private", "unlisted"] as const;
  type Visibility = typeof allowedVisibilities[number];

  const handleCreateCollection = async (collectionData: CollectionInsert) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }
      const title = collectionData.title?.trim() || ""
      const description = collectionData.description ? collectionData.description.trim() : null
      // Handle tags as comma-separated string or array, default to empty string if undefined
      const tags = Array.isArray(collectionData.tags)
        ? collectionData.tags.map((tag: string) => tag.trim()).filter(Boolean)
        : (collectionData.tags ?? "").split(",").map((tag: string) => tag.trim()).filter(Boolean)
      const visibility: Visibility = allowedVisibilities.includes(collectionData.visibility as Visibility)
        ? (collectionData.visibility as Visibility)
        : "private";
      const requestBody: CollectionInsert = {
        title,
        description,
        tags,
        visibility,
        images: collectionData.images && collectionData.images.length > 0 ? collectionData.images : null,
        collaborators: collectionData.collaborators ?? [],
        prompts: Array.isArray(collectionData.prompts)
          ? collectionData.prompts.map((p) => p)
          : [],
        user_id: user.id,
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

  const handleCreatePrompt = async (promptData: PromptInsert) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }
      // Handle tags as comma-separated string or array, default to empty string if undefined
      const tags = Array.isArray(promptData.tags)
        ? promptData.tags.map((tag: string) => tag.trim()).filter(Boolean)
        : (promptData.tags ?? "").split(",").map((tag: string) => tag.trim()).filter(Boolean)
      const visibility: Visibility = allowedVisibilities.includes(promptData.visibility as Visibility)
        ? (promptData.visibility as Visibility)
        : "private";
      const transformedPrompt: PromptInsert = {
        title: promptData.title,
        description: promptData.description,
        tags,
        content: promptData.content,
        visibility,
        images: promptData.images,
        collaborators: promptData.collaborators ?? [],
        collections: promptData.collections ?? [],
        user_id: user.id,
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
        /*
          availablePrompts={prompts
          .filter((p) => !p.deleted)
          .map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description || undefined,
            content: p.content,
            tags: p.tags,
          }))}
        */
      />

      {/* Create Prompt Dialog */}
      <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="" maxWidth="max-w-3xl">
        <NewPromptPage onSubmit={handleCreatePrompt} onCancel={() => setShowCreateDialog(false)} />
      </Dialog>
    </div>
  )
}
