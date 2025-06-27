import { useRef, useEffect, useState } from "react"
import { Ellipsis, Plus, Edit, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/appContext"
import EditCollectionDialog from "@/components/editCollection"

interface CollectionActionsProps {
  collectionId: string
  collectionTitle?: string
  popupPosition: { x: number; y: number }
}

export function CollectionActions({ collectionId, collectionTitle = '', popupPosition }: CollectionActionsProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [renameValue, setRenameValue] = useState(collectionTitle)
  const [renamePosition, setRenamePosition] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { actions, state } = useApp()

  // Add Prompt dialog state
  const [showAddPromptDialog, setShowAddPromptDialog] = useState(false)
  const [addPromptPosition, setAddPromptPosition] = useState<{ x: number; y: number } | null>(null)
  const [promptSearch, setPromptSearch] = useState("")
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([])

  // Edit Collection dialog state
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)

  // Get all prompts not already in this collection
  const prompts = state.prompts.filter(
    p => !p.deleted && (!p.collections || !p.collections.includes(collectionId))
  )
  const filteredPrompts = prompts.filter(
    p =>
      p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
      (p.description?.toLowerCase().includes(promptSearch.toLowerCase()) ?? false) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(promptSearch.toLowerCase())))
  )

  // Sort prompts alphabetically by title if not searching
  const sortedPrompts = promptSearch.trim() === ""
    ? [...prompts].sort((a, b) => a.title.localeCompare(b.title))
    : filteredPrompts

  // Find the current collection data from state
  const collectionData = state.collections?.find((c: any) => c.id === collectionId)
  const collection = collectionData || { id: collectionId, title: collectionTitle }

  const [showPopup, setShowPopup] = useState(false)
  const [popupPositionState, setPopupPosition] = useState<{ x: number; y: number } | null>(null)

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

  function openAddPromptDialog(mouseX: number, mouseY: number) {
    setShowPopup(false)
    setShowAddPromptDialog(true)
    setAddPromptPosition({ x: mouseX, y: mouseY })
    setPromptSearch("")
    setSelectedPromptIds([])
  }

  function closeAddPromptDialog() {
    setShowAddPromptDialog(false)
    setAddPromptPosition(null)
    setPromptSearch("")
    setSelectedPromptIds([])
  }

  async function handleAddPrompts() {
    await actions.addPromptToCollection(collectionId, selectedPromptIds)
    await actions.loadPrompts() // Refresh the prompt list
    closeAddPromptDialog()
  }

  function openEditDialog() {
    setShowPopup(false)
    setShowEditDialog(true)
    setEditForm({
      title: collectionData?.title || collectionTitle || '',
      description: collectionData?.description || '',
      tags: Array.isArray(collectionData?.tags) ? collectionData.tags.join(", ") : (collectionData?.tags || ''),
      visibility: collectionData?.visibility || 'private',
      images: collectionData?.images || [],
      collaborators: Array.isArray(collectionData?.collaborators)
        ? collectionData.collaborators.filter((c: any) => typeof c === 'object' && c !== null && 'id' in c)
        : [],
      id: collectionId,
    })
  }

  function closeEditDialog() {
    setShowEditDialog(false)
    setEditForm(null)
  }

  return (
    <>
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
            onClick={e => {
              setShowPopup(false)
              if (e && e.nativeEvent) {
                const mouseX = e.nativeEvent.clientX
                const mouseY = e.nativeEvent.clientY
                openAddPromptDialog(mouseX, mouseY)
              } else {
                openAddPromptDialog(window.innerWidth / 2, window.innerHeight / 2)
              }
            }}
          >
            <Plus size={16} />
            Add Prompt
          </button>
          <button
            className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
            onClick={openEditDialog}
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
      {showAddPromptDialog && addPromptPosition && (
        <div
          style={{
            position: "fixed",
            left: addPromptPosition.x,
            top: addPromptPosition.y,
            zIndex: 200,
            background: "var(--deep-charcoal)",
            border: "1px solid var(--wisp-blue)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            padding: "18px 22px",
            minWidth: 320,
            minHeight: 220,
            maxHeight: 400,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <input
            className="mb-3 rounded border border-[var(--moonlight-silver-dim)] bg-[var(--deep-charcoal)] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--wisp-blue)] text-base placeholder:text-gray-400"
            placeholder="Search prompts..."
            value={promptSearch}
            onChange={e => setPromptSearch(e.target.value)}
            autoFocus
          />
          <div className="flex-1 overflow-y-auto mb-3" style={{ maxHeight: 250 }}>
            {sortedPrompts.length === 0 ? (
              <div className="text-xs text-gray-400 py-6 text-center">No prompts found.</div>
            ) : (
              <ul className="space-y-1">
                {sortedPrompts.map(prompt => (
                  <li key={prompt.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-[var(--wisp-blue)]/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPromptIds.includes(prompt.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedPromptIds(ids => [...ids, prompt.id])
                        else setSelectedPromptIds(ids => ids.filter(id => id !== prompt.id))
                      }}
                      className="accent-[var(--wisp-blue)]"
                    />
                    <span className="truncate text-white text-sm">{prompt.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" className="rounded px-4 py-2 text-gray-300 hover:bg-gray-700" onClick={closeAddPromptDialog}>Cancel</Button>
            <Button
              variant="default"
              className="rounded px-4 py-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue-dark)] text-white font-semibold"
              onClick={handleAddPrompts}
              disabled={selectedPromptIds.length === 0}
            >Add {selectedPromptIds.length > 0 ? selectedPromptIds.length : ''} Prompt{selectedPromptIds.length === 1 ? '' : 's'}</Button>
          </div>
        </div>
      )}
      {/* Edit Collection Dialog */}
      {showEditDialog && (
        <EditCollectionDialog
          open={showEditDialog}
          onClose={closeEditDialog}
          initialData={editForm}
        />
      )}
    </>
  )
}
