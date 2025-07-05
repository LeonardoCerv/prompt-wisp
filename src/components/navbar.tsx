"use client"

import type React from "react"
import { toast } from "sonner"
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

  const handleCreateCollection = async () => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated")
        return
      }
      const requestBody: CollectionInsert = {
        title: undefined,
        description: undefined,
        tags: [],
        visibility: "private",
        images: [],
      }

      console.log("Creating collection with data:", requestBody)

      const newCollection = await actions.createCollection(requestBody)
      toast.success("Collection created successfully")
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
            <Sidebar onCreateCollection={() => handleCreateCollection()} />
          </div>

          {/* Center Column - Prompt List */}
          <PromptList />

          {/* Right Column - Main Content */}
          <div className="flex-1 h-full">{children}</div>
        </div>
      </div>

      {/* New Collection Dialog 
      <NewCollection
        open={isNewCollectionOpen}
        onOpenChange={setIsNewCollectionOpen}
        onSubmit={handleCreateCollection}
      />
      */}

    </div>
  )
}
