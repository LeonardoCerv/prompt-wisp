"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { NavigationSection } from "./navigationSection"
import { CollectionsSection } from "./collectionsSection"
import { TagsSection } from "./tagsSection"
import { useApp } from "@/contexts/appContext"

interface SidebarProps {
  onCreateCollection: () => void
}

export function Sidebar({ onCreateCollection }: SidebarProps) {
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const { state, actions } = useApp()
  const { selectedFilter } = state.filters

  return (
    <div className="w-[240px] max-w-[240px] flex-shrink-0 h-screen bg-[var(--black)] px-2 py-6 border-r border-[var(--moonlight-silver-dim)]/30 flex flex-col fixed top-0 left-0 z-50">
      {/* Header - Fixed at top */}
      <NavigationSection searchInputRef={searchInputRef} />

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        <CollectionsSection onCreateCollection={onCreateCollection} />
        <TagsSection />
      </div>

      {/* Recently Deleted - Fixed at bottom */}
      <div className="flex-shrink-0 mt-6">
        <Button
          variant="destructive"
          className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
            selectedFilter === "deleted"
              ? "text-white shadow-sm bg-destructive/90"
              : "text-destructive hover:bg-destructive/50 hover:text-white"
          }`}
          onClick={() => actions.setFilter("deleted")}
          title="Recently Deleted"
        >
          <Trash2 size={16} className="flex-shrink-0" />
          <span className="truncate">Recently Deleted</span>
        </Button>
      </div>
    </div>
  )
}
