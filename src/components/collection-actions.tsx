"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Plus, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/appContext"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"
import type { PromptData } from "@/lib/models"

interface CollectionActionsProps {
  collectionId: string
  collectionTitle?: string
  popupPosition: { x: number; y: number }
  onRequestClose: () => void
}

export function CollectionActions({
  collectionId,
  collectionTitle = "",
  popupPosition,
  onRequestClose,
}: CollectionActionsProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [renameValue, setRenameValue] = useState(collectionTitle)
  const [renamePosition, setRenamePosition] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { actions, state, utils } = useApp()

  // Add Prompt dialog state
  const [showAddPromptDialog, setShowAddPromptDialog] = useState(false)
  const [addPromptPosition, setAddPromptPosition] = useState<{ x: number; y: number } | null>(null)
  const [promptSearch, setPromptSearch] = useState("")
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([])
  const [collectionPrompts, setCollectionPrompts] = useState<PromptData[]>([])

  // Load collection prompts when component mounts or collectionId changes
  useEffect(() => {
    async function loadCollectionPrompts() {
      if (!collectionId) return
      try {
        const prompts = await utils.getCollectionPrompts(collectionId)
        setCollectionPrompts(prompts)
      } catch (error) {
        console.error("Error loading collection prompts:", error)
        setCollectionPrompts([])
      }
    }
    
    loadCollectionPrompts()
  }, [collectionId, utils])

  useEffect(() => {
    if (showRenameDialog && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [showRenameDialog])

  const closeAllDialogs = useCallback(() => {
    setShowRenameDialog(false)
    setRenameValue(collectionTitle)
    setRenamePosition(null)
    setShowAddPromptDialog(false)
    setAddPromptPosition(null)
    setPromptSearch("")
    setSelectedPromptIds([])
    if (onRequestClose) onRequestClose()
  }, [collectionTitle, onRequestClose])

  useEffect(() => {
    if (!showRenameDialog && !showAddPromptDialog && !popupRef.current) return
    const handleClick = (e: MouseEvent) => {
      const addPromptDialog = document.getElementById("add-prompt-dialog")
      const isInRename = showRenameDialog && inputRef.current && inputRef.current.contains(e.target as Node)
      const isInAddPrompt = showAddPromptDialog && addPromptDialog && addPromptDialog.contains(e.target as Node)
      const isInMainPopup = popupRef.current && popupRef.current.contains(e.target as Node)
      if (!isInRename && !isInAddPrompt && !isInMainPopup) {
        closeAllDialogs()
      }
    }
    window.addEventListener("mousedown", handleClick)
    return () => window.removeEventListener("mousedown", handleClick)
  }, [showRenameDialog, showAddPromptDialog, popupRef, closeAllDialogs])

  function closeRenameDialog(forceAll = false) {
    if (forceAll) return closeAllDialogs()
    setShowRenameDialog(false)
    setRenameValue(collectionTitle)
    setRenamePosition(null)
  }

  async function handleRenameSubmit() {
    if (renameValue.trim() && renameValue.trim() !== collectionTitle) {
      try {
        await actions.updateCollection(collectionId, { title: renameValue.trim() })
        toast.success("Collection renamed successfully")
      } catch (error) {
        console.error("Error renaming collection:", error)
        toast.error("Failed to rename collection")
      }
    }
    closeRenameDialog()
  }

  async function handleDelete() {
    try {
      if (confirm("Are you sure you want to delete this collection?")) {
        await actions.deleteCollection(collectionId)
        toast.success("Collection deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast.error("Failed to delete collection")
    }
  }

  function openAddPromptDialog(mouseX: number, mouseY: number) {
    setShowAddPromptDialog(true)
    
    // Calculate dialog dimensions
    const dialogWidth = 320
    const dialogHeight = 400 // max height
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Calculate position ensuring dialog stays within viewport
    let x = mouseX
    let y = mouseY
    
    // Adjust horizontal position if dialog would overflow
    if (x + dialogWidth > viewportWidth) {
      x = viewportWidth - dialogWidth - 20 // 20px margin from edge
    }
    if (x < 20) {
      x = 20 // minimum 20px margin from left edge
    }
    
    // Adjust vertical position if dialog would overflow
    if (y + dialogHeight > viewportHeight) {
      y = viewportHeight - dialogHeight - 20 // 20px margin from bottom
    }
    if (y < 20) {
      y = 20 // minimum 20px margin from top
    }
    
    setAddPromptPosition({ x, y })
    setPromptSearch("")
    setSelectedPromptIds([])
  }

  function closeAddPromptDialog(forceAll = false) {
    if (forceAll) return closeAllDialogs()
    setShowAddPromptDialog(false)
    setAddPromptPosition(null)
    setPromptSearch("")
    setSelectedPromptIds([])
  }

  async function handleAddPrompts() {
    try {
      await actions.addPromptToCollection(collectionId, selectedPromptIds)
      toast.success(`Added ${selectedPromptIds.length} prompt(s) to collection`)
      
      // Refresh collection prompts
      const updatedPrompts = await utils.getCollectionPrompts(collectionId)
      setCollectionPrompts(updatedPrompts)
      
      closeAddPromptDialog()
    } catch (error) {
      console.error("Error adding prompts to collection:", error)
      toast.error("Failed to add prompts to collection")
    }
  }

  function openRenameDialog(mouseX: number, mouseY: number) {
    setShowRenameDialog(true)
    setRenameValue(collectionTitle)
    setRenamePosition({ x: mouseX, y: mouseY })
  }

  // Get all prompts that user has access to but not already in this collection
  const collectionPromptIds = collectionPrompts.map((p) => p.id)
  const availablePrompts = state.prompts.filter(
    (p) => !p.deleted && utils.hasAccessToPrompt(p.id) && !collectionPromptIds.includes(p.id),
  )

  const filteredPrompts = availablePrompts.filter(
    (p) =>
      p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
      (p.description?.toLowerCase().includes(promptSearch.toLowerCase()) ?? false) ||
      (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(promptSearch.toLowerCase()))),
  )

  // Sort prompts alphabetically by title if not searching
  const sortedPrompts =
    promptSearch.trim() === "" ? [...availablePrompts].sort((a, b) => a.title.localeCompare(b.title)) : filteredPrompts

  return (
    <>
      {(showRenameDialog || showAddPromptDialog) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99,
            background: "rgba(0,0,0,0.01)",
          }}
        />
      )}
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
          display: showRenameDialog || showAddPromptDialog ? "none" : "flex",
          flexDirection: "column",
          gap: 2,
          transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
          onClick={(e) => {
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
        {/* 
        <button
          className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
          onClick={() => setShowEditDialog(true)}
        >
          <Edit size={16} />
          Edit Collection
        </button>
              */}
        <button
          className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
          onClick={(e) => {
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
        <div className="border-2 border-[var(--wisp-blue)]">
          <Textarea
            variant="editor"
            ref={inputRef}
            id="rename-input"
            placeholder="New title"
            className="text-base font-bold p-4 resize-none overflow-hidden bg-neutral-900focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[48px] w-fit"
            rows={1}
            style={{
            position: "fixed",
            left: popupPosition.x -177,
            top: popupPosition.y -24,
            zIndex: 200,
            lineHeight: 1,
            }}
            value={renameValue || collectionTitle}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit()
              if (e.key === "Escape") closeRenameDialog()
            }}
            autoFocus
          /> </div>
      )}
      {showAddPromptDialog && addPromptPosition && (
        <div
          id="add-prompt-dialog"
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
            flexDirection: "column",
          }}
        >
          <input
            className="mb-3 rounded border border-[var(--moonlight-silver-dim)] bg-[var(--deep-charcoal)] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--wisp-blue)] text-base placeholder:text-gray-400"
            placeholder="Search prompts..."
            value={promptSearch}
            onChange={(e) => setPromptSearch(e.target.value)}
            autoFocus
          />
          <div className="flex-1 overflow-y-auto mb-3" style={{ maxHeight: 250 }}>
            {sortedPrompts.length === 0 ? (
              <div className="text-xs text-gray-400 py-6 text-center">No prompts found.</div>
            ) : (
              <ul className="space-y-1">
                {sortedPrompts.map((prompt) => (
                  <li
                    key={prompt.id}
                    className="flex items-center gap-2 px-1 py-1 rounded hover:bg-[var(--wisp-blue)]/10 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPromptIds.includes(prompt.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPromptIds((ids) => [...ids, prompt.id])
                        else setSelectedPromptIds((ids) => ids.filter((id) => id !== prompt.id))
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
            <Button
              variant="ghost"
              className="rounded px-4 py-2 text-gray-300 hover:bg-gray-700"
              onClick={() => closeAddPromptDialog(true)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="rounded px-4 py-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue-dark)] text-white font-semibold"
              onClick={handleAddPrompts}
              disabled={selectedPromptIds.length === 0}
            >
              Add {selectedPromptIds.length > 0 ? selectedPromptIds.length : ""} Prompt
              {selectedPromptIds.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}
      {/* Edit Collection Dialog 
      {showEditDialog && (
        <EditCollectionDialog
          collectionId={collectionId} 
          open={showEditDialog}
          onClose={() => setShowEditDialog(true)}
        />
      )}
      */}
    </>
  )
}
