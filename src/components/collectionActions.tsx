import { useRef, useEffect, useState } from "react"
import { Ellipsis, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/appContext"
import { toast } from "sonner"

interface CollectionActionsProps {
  collectionId: string
  disabled?: boolean
}

export function CollectionActions({ collectionId, disabled }: CollectionActionsProps) {
  const { actions } = useApp()
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showPopup && popupRef.current && popupPosition) {
      const popup = popupRef.current
      const rect = popup.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      let newX = popupPosition.x
      let newY = popupPosition.y
      if (newX + rect.width > vw) {
        newX = Math.max(0, vw - rect.width)
      }
      if (newY + rect.height > vh) {
        newY = Math.max(0, popupPosition.y - rect.height)
      }
      if (newX !== popupPosition.x || newY !== popupPosition.y) {
        setPopupPosition({ x: newX, y: newY })
      }
    }
  }, [showPopup, popupPosition])

  useEffect(() => {
    if (!showPopup) return
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false)
        setPopupPosition(null)
      }
    }
    window.addEventListener("mousedown", handleClick)
    return () => window.removeEventListener("mousedown", handleClick)
  }, [showPopup])

  return (
    <>
      <Button
        size="icon"
        variant="icon"
        disabled={disabled}
        onClick={e => {
          e.stopPropagation()
          setShowPopup(!showPopup)
          if (!showPopup) {
            setPopupPosition({ x: e.clientX, y: e.clientY })
          } else {
            setPopupPosition(null)
          }
        }}
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Ellipsis size={14} />
      </Button>
      {showPopup && popupPosition && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            left: popupPosition.x,
            top: popupPosition.y,
            zIndex: 100,
            minWidth: 160,
            background: "var(--deep-charcoal)",
            border: "1px solid var(--moonlight-silver-dim)",
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded px-2 py-1 transition-colors cursor-pointer"
            onClick={async () => {
              // For demo: just add a dummy prompt (should show a modal in real app)
              try {
                await actions.addPromptToCollection(collectionId, "dummy-prompt-id")
                toast.success("Prompt added to collection!")
                setShowPopup(false)
              } catch (e) {
                toast.error("Failed to add prompt")
              }
            }}
          >
            <Plus size={16} />
            Add Prompt
          </button>
          <button
            className="text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded px-2 py-1 transition-colors cursor-pointer"
            onClick={async () => {
              // For demo: just update description (should show a modal in real app)
              const newDesc = prompt("New description?")
              if (newDesc !== null) {
                try {
                  await actions.editCollection(collectionId, { description: newDesc })
                  toast.success("Collection updated!")
                  setShowPopup(false)
                } catch (e) {
                  toast.error("Failed to update collection")
                }
              }
            }}
          >Edit Collection</button>
          <button
            className="text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded px-2 py-1 transition-colors cursor-pointer"
            onClick={async () => {
              const newTitle = prompt("Rename collection:")
              if (newTitle && newTitle.trim()) {
                try {
                  await actions.renameCollection(collectionId, newTitle.trim())
                  toast.success("Collection renamed!")
                  setShowPopup(false)
                } catch (e) {
                  toast.error("Failed to rename collection")
                }
              }
            }}
          >Rename</button>
          <button
            className="text-left text-sm text-red-400 hover:bg-red-400/10 rounded px-2 py-1 transition-colors cursor-pointer"
            onClick={async () => {
              if (confirm("Are you sure you want to delete this collection?")) {
                try {
                  await actions.deleteCollection(collectionId)
                  toast.success("Collection deleted!")
                  setShowPopup(false)
                } catch (e) {
                  toast.error("Failed to delete collection")
                }
              }
            }}
          >Delete</button>
        </div>
      )}
    </>
  )
}
