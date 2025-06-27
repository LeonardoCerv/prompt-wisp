import { useRef, useEffect, useState } from "react"
import { Ellipsis, Plus, Edit, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/appContext"

interface CollectionActionsProps {
  collectionId: string
  collectionTitle?: string
  disabled?: boolean
}

export function CollectionActions({ collectionId, collectionTitle = '', disabled }: CollectionActionsProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [renameValue, setRenameValue] = useState(collectionTitle)
  const [renamePosition, setRenamePosition] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { actions } = useApp()

  useEffect(() => {
    if (showPopup && popupRef.current && popupPosition) {
      const popup = popupRef.current
      const rect = popup.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      let newX = popupPosition.x
      let newY = popupPosition.y
      if (newX + rect.width > vw) newX = Math.max(0, vw - rect.width)
      if (newY + rect.height > vh) newY = Math.max(0, popupPosition.y - rect.height)
      if (newX !== popupPosition.x || newY !== popupPosition.y) setPopupPosition({ x: newX, y: newY })
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

  useEffect(() => {
    if (showRenameDialog && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
    if (!showRenameDialog) return
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) closeRenameDialog()
    }
    window.addEventListener("mousedown", handleClick)
    return () => window.removeEventListener("mousedown", handleClick)
  }, [showRenameDialog])

  function openRenameDialog(mouseX: number, mouseY: number) {
    setShowPopup(false)
    setShowRenameDialog(true)
    setRenameValue(collectionTitle)
    setRenamePosition({ x: mouseX, y: mouseY })
  }

  function closeRenameDialog() {
    setShowRenameDialog(false)
    setRenameValue(collectionTitle)
    setRenamePosition(null)
  }

  async function handleRenameSubmit() {
    if (renameValue.trim() && renameValue.trim() !== collectionTitle) {
      await actions.renameCollection(collectionId, renameValue.trim())
    }
    closeRenameDialog()
  }

  async function handleDelete() {
    await actions.deleteCollection(collectionId)
    setShowPopup(false)
  }

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
        aria-label="Collection actions"
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
            minWidth: 180,
            background: "var(--deep-charcoal)",
            border: "1px solid var(--moonlight-silver-dim)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            padding: "10px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
            onClick={() => setShowPopup(false)}
          >
            <Plus size={16} />
            Add Prompt
          </button>
          <button
            className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
            onClick={() => setShowPopup(false)}
          >
            <Edit size={16} />
            Edit Collection
          </button>
          <button
            className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
            onClick={e => {
              setShowPopup(false)
              if (e && e.nativeEvent) {
                const mouseX = e.nativeEvent.clientX
                const mouseY = e.nativeEvent.clientY
                openRenameDialog(mouseX, mouseY)
              } else {
                openRenameDialog(window.innerWidth / 2, window.innerHeight / 2)
              }
            }}
          >
            <Type size={16} />
            Rename
          </button>
          <button
            className="flex items-center gap-2 text-left text-sm text-red-400 hover:bg-red-400/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
      {showRenameDialog && renamePosition && (
        <div
          style={{
            position: "fixed",
            left: renamePosition.x,
            top: renamePosition.y,
            zIndex: 200,
            background: "var(--deep-charcoal)",
            border: "1px solid var(--wisp-blue)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            padding: "12px 18px",
            minWidth: 220,
            display: "flex",
            alignItems: "center"
          }}
        >
          <input
            ref={inputRef}
            className="w-full bg-transparent text-white text-base font-semibold px-2 py-1 outline-none border-b border-[var(--wisp-blue)] focus:border-[var(--wisp-blue)]"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') closeRenameDialog()
            }}
            autoFocus
          />
        </div>
      )}
    </>
  )
}
