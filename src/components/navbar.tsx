"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import NewCollection from "@/components/new-collection"
import { Sidebar } from "./sidebar"
import { PromptList } from "./prompt-list"
import { useApp } from "@/contexts/appContext"
import type { CollectionInsert } from "@/lib/models"

interface NavbarProps {
  children?: React.ReactNode
}

export default function Navbar({ children }: NavbarProps) {
  const { state, actions } = useApp()
  const { user } = state

  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)

  const allowedVisibilities = ["public", "private", "unlisted"] as const
  type Visibility = (typeof allowedVisibilities)[number]

  const handleCreateCollection = async (collectionData: CollectionInsert) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated")
        return
      }

      const title = collectionData.title?.trim() || ""
      const description = collectionData.description ? collectionData.description.trim() : undefined
      const tags = Array.isArray(collectionData.tags)
        ? collectionData.tags.map((tag: string) => tag.trim()).filter(Boolean)
        : (collectionData.tags ?? "")
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
      const visibility: Visibility = allowedVisibilities.includes(collectionData.visibility as Visibility)
        ? (collectionData.visibility as Visibility)
        : "private"

      const requestBody: CollectionInsert = {
        title,
        description,
        tags,
        visibility,
        images: collectionData.images && collectionData.images.length > 0 ? collectionData.images : [],
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

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-screen">
        <div className="flex gap-0 h-full">
          {/* Left Column - Filters */}
          <div className="w-[240px] max-w-[240px] flex-shrink-0">
            <Sidebar onCreateCollection={() => setIsNewCollectionOpen(true)} />
          </div>

          {/* Center Column - Prompt List */}
          <PromptList />

          {/* Right Column - Main Content */}
          <div className="flex-1 h-full">{children}</div>
        </div>
      </div>

      {/* New Collection Dialog */}
      <NewCollection
        open={isNewCollectionOpen}
        onOpenChange={setIsNewCollectionOpen}
        onSubmit={handleCreateCollection}
      />

    </div>
  )
}
