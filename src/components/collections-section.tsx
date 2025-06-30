"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Ellipsis, Plus } from "lucide-react"
import { useApp } from "@/contexts/appContext"
import { useState, useEffect } from "react"
import { CollectionActions } from "@/components/collection-actions"

interface CollectionsSectionProps {
  onCreateCollection: () => void
}

export function CollectionsSection({ onCreateCollection }: CollectionsSectionProps) {
   const [showPopup, setShowPopup] = useState(false)
   const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
   const [popupCollectionId, setPopupCollectionId] = useState<string | null>(null)
   const { state, actions } = useApp()
   const { collections, loading } = state
   const { collectionsExpanded } = state.ui
   const { selectedFilter, selectedCollection } = state.filters
   const [hoveredCollection, setHoveredCollection] = useState<string | null>(null)

  // Close popup on outside click
  useEffect(() => {
    if (!showPopup) return
    const handleClick = (e: MouseEvent) => {
      const popup = document.getElementById('collection-actions-popup')
      if (popup && !popup.contains(e.target as Node)) {
        setShowPopup(false)
        setPopupPosition(null)
        setPopupCollectionId(null)
        setHoveredCollection(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPopup])

  // Prevent background scrolling and interaction when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showPopup])

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
            onClick={e => {
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
            collections.map(collection => (
              <div
                key={collection.id}
                className={`relative w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                  selectedCollection === collection.id && selectedFilter === "collection"
                    ? "bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)]"
                    : "text-[var(--moonlight-silver)] hover:text-white hover:bg-white/5"
                }`}
                onMouseEnter={() => {
                  if (!showPopup || popupCollectionId !== collection.id) {
                    setHoveredCollection(collection.id)
                  }
                }}
                onMouseLeave={() => {
                  if (!showPopup || popupCollectionId !== collection.id) {
                    setHoveredCollection(null)
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 justify-start text-sm text-left truncate"
                    onClick={() => {
                      actions.setFilter("collection", { collection: collection.id })
                    }}
                    title={collection.title || "New Collection"}
                  >
                    {collection.title || "New Collection"}
                  </Button>

                  <div className={`${hoveredCollection === collection.id && (!showPopup || popupCollectionId !== collection.id) ? "flex" : "hidden"}`}>
                    <Button
                      size="icon"
                      variant="icon"
                      onClick={e => {
                        e.stopPropagation()
                        setShowPopup(true)
                        setPopupCollectionId(collection.id)
                        setPopupPosition({ x: e.clientX, y: e.clientY })
                      }}
                      className={`h-6 w-6 p-0 text-gray-400 hover:text-gray-200 flex`}
                      aria-label="Collection actions"
                    >
                      <Ellipsis size={14} />
                    </Button>
                  </div>
                  {showPopup && popupPosition && popupCollectionId === collection.id && (
                    <>
                      {/* Overlay to block background interaction */}
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100vw',
                          height: '100vh',
                          zIndex: 99,
                          background: 'rgba(0,0,0,0.01)',
                        }}
                      />
                      <div id="collection-actions-popup" style={{ zIndex: 100, position: 'fixed', left: popupPosition.x, top: popupPosition.y }}>
                        <CollectionActions
                          collectionId={collection.id}
                          popupPosition={popupPosition}
                          onRequestClose={() => {
                          setShowPopup(false)
                          setPopupPosition(null)
                          setPopupCollectionId(null)
                          setHoveredCollection(null)
                        }}
                        />
                      </div>
                    </>
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


