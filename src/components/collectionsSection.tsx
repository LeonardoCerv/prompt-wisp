"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Loader2, Trash2, Ellipsis } from "lucide-react"
import { useApp } from "@/contexts/appContext"
import { useState } from "react"

interface CollectionsSectionProps {
  onCreateCollection: () => void
}

export function CollectionsSection({ onCreateCollection }: CollectionsSectionProps) {
  const { state, actions } = useApp()
  const { collections, loading } = state
  const { collectionsExpanded } = state.ui
  const { selectedFilter, selectedCollection } = state.filters
  const [ showPopup, setShowPopup ] = useState(false)

  // Track which collection is hovered
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null)

  return (
    <div className="space-y-2 px-2">
      <h3
        className="text-[10px] font-medium text-[var(--wisp-blue)] uppercase tracking-wider cursor-pointer transition-colors flex justify-between gap-2"
        onClick={actions.toggleCollectionsExpanded}
      >
        Collections
        {collectionsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </h3>

      {collectionsExpanded && (
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onCreateCollection()
            }}
            className="w-full justify-start gap-3 text-sm justify-center text-[var(--wisp-blue)] rounded-lg py-2 px-3 hover:bg-[var(--wisp-blue)]/20 hover:text-[var(--wisp-blue)] border border-dashed border-[var(--wisp-blue)]/40"
            title="Create new collection"
          >
            <Plus size={14} className="flex-shrink-0" />
            <span className="truncate">Create Collection</span>
          </Button>

          {loading.collections ? (
            <div className="text-xs text-[var(--moonlight-silver)]/60 px-3 py-2">Loading collections...</div>
          ) : collections.length > 0 ? (
            collections.map((collection) => (
              <div
                key={collection.id}
                className={`relative w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                  selectedCollection === collection.id && selectedFilter === "collection"
                    ? "bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)]"
                    : "text-[var(--moonlight-silver)] hover:text-white hover:bg-white/5"
                }`}
                onMouseEnter={() => setHoveredCollection(collection.id)}
                onMouseLeave={() => setHoveredCollection(null)}
              >
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    className={`flex-1 justify-start text-sm text-left truncate`}
                    onClick={() => {
                      console.log("Clicking collection:", collection.id, collection.title)
                      actions.setFilter("collection", { collection: collection.id })
                    }}
                    title={collection.title}
                  >
                    {collection.title}
                  </Button>
                  {/* Menu trigger (three dots) always visible for accessibility, but menu only on hover */}
                  <Button
                    size="sm"
                    variant="icon"
                    disabled={!selectedCollection}
                    onClick={() => setShowPopup(!showPopup)}
                    className="h-9 w-9 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Ellipsis size={22} />
                  </Button>
                  {/* Popup menu, only visible on hover */}
                  {showPopup && hoveredCollection == collection.id && (
                    <div className="absolute -right-20 top-10 z-100 min-w-[160px] bg-[var(--deep-charcoal)] border border-[var(--moonlight-silver-dim)]/40 rounded-lg shadow-lg py-2 px-3 flex flex-col gap-1">
                      <button className="text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded px-2 py-1 transition-colors cursor-pointer">Edit Collection</button>
                      <button className="text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded px-2 py-1 transition-colors cursor-pointer">Rename</button>
                      <button className="text-left text-sm text-red-400 hover:bg-red-400/10 rounded px-2 py-1 transition-colors cursor-pointer">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-[var(--moonlight-silver)]/60 px-3 py-2">
              No collections yet. Click + to create one!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
