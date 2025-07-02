"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Trash2, User2 } from "lucide-react"
import { NavigationSection } from "./navigation-section"
import { CollectionsSection } from "./collections-section"
import { TagsSection } from "./tags-section"
import { useApp } from "@/contexts/appContext"
import {signout} from './actions'

interface SidebarProps {
  onCreateCollection: () => void
}

export function Sidebar({ onCreateCollection }: SidebarProps) {
  const { state, actions } = useApp()
  const { selectedFilter } = state.filters

  return (
    <div className="w-[240px] max-w-[240px] flex-shrink-0 h-screen bg-[var(--black)] px-2 py-6 border-r border-[var(--moonlight-silver-dim)]/30 flex flex-col fixed top-0 left-0 z-50">
      <div className="mt-8 mb-4 flex p-3 items-center gap-2 text-moonlight-silver">
        <User2 size={16} />
          <span className="text-sm">
            {state.user?.user_metadata.full_name || state.user?.email}
          </span>
      </div>

      {/* Header - Fixed at top */}
      <NavigationSection />

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
    
              <Button 
                onClick={signout}
                variant="outline" 
                size="default"
                className="gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
      </div>
    </div>
  )
}
