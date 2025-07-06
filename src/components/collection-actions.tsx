"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Plus, Trash2, Type, Share, Globe, Lock, Users, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/appContext"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"
import type { PromptData } from "@/lib/models"
import type { CollectionData } from "@/lib/models/collection"

interface CollectionActionsProps {
  collectionId: string
  collectionTitle?: string
  popupPosition: { x: number; y: number }
  onRequestClose: () => void
  userRole?: "owner" | "buyer" | "collaborator" | null
}

export function CollectionActions({
  collectionId,
  collectionTitle = "",
  popupPosition,
  onRequestClose,
  userRole = null,
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

  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [sharePosition, setSharePosition] = useState<{ x: number; y: number } | null>(null)

  // Collection data for share functionality
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | null>(null)

  // Load collection data and prompts when component mounts or collectionId changes
  useEffect(() => {
    async function loadCollectionData() {
      if (!collectionId) return
      try {
        const collection = state.collections.find(c => c.id === collectionId)
        if (collection) {
          setSelectedCollection(collection)
        }
        
        const prompts = await utils.getCollectionPrompts(collectionId)
        setCollectionPrompts(prompts)
      } catch (error) {
        console.error("Error loading collection data:", error)
        setCollectionPrompts([])
      }
    }
    
    loadCollectionData()
  }, [collectionId, utils, state.collections])

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
    setShowShareDialog(false)
    setSharePosition(null)
    if (onRequestClose) onRequestClose()
  }, [collectionTitle, onRequestClose])

  useEffect(() => {
    if (!showRenameDialog && !showAddPromptDialog && !showShareDialog && !popupRef.current) return
    const handleClick = (e: MouseEvent) => {
      const addPromptDialog = document.getElementById("add-prompt-dialog")
      const shareDialog = document.getElementById("share-dialog")
      const isInRename = showRenameDialog && inputRef.current && inputRef.current.contains(e.target as Node)
      const isInAddPrompt = showAddPromptDialog && addPromptDialog && addPromptDialog.contains(e.target as Node)
      const isInShare = showShareDialog && shareDialog && shareDialog.contains(e.target as Node)
      const isInMainPopup = popupRef.current && popupRef.current.contains(e.target as Node)
      
      if (!isInRename && !isInAddPrompt && !isInShare && !isInMainPopup) {
        closeAllDialogs()
      }
    }
    window.addEventListener("mousedown", handleClick)
    return () => window.removeEventListener("mousedown", handleClick)
  }, [showRenameDialog, showAddPromptDialog, showShareDialog, popupRef, closeAllDialogs])

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
      if (userRole === "owner") {
        if (confirm("Are you sure you want to delete this collection?")) {
          await actions.deleteCollection(collectionId)
          toast.success("Collection deleted successfully")
        }
      } else {
        // Non-owners can only remove the collection from their library
        if (confirm("Remove this collection from your library?")) {
          await actions.removeFromCollection(collectionId)
          toast.success("Collection removed from your library")
        }
      }
    } catch (error) {
      console.error("Error deleting/removing collection:", error)
      toast.error(userRole === "owner" ? "Failed to delete collection" : "Failed to remove collection")
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

  function openShareDialog(mouseX: number, mouseY: number) {
    setShowShareDialog(true)
    
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
    
    setSharePosition({ x, y })
  }

  function closeShareDialog(forceAll = false) {
    if (forceAll) return closeAllDialogs()
    setShowShareDialog(false)
    setSharePosition(null)
  }

  // Share functionality
  const handleVisibilityChange = async (visibility: "public" | "private" | "unlisted") => {
    if (!selectedCollection) return
    
    try {
      // Update the collection visibility
      await actions.updateCollection(collectionId, { visibility })
      setSelectedCollection({ ...selectedCollection, visibility })
      
      // Update all prompts in the collection to match the visibility
      const promptIds = collectionPrompts.map(p => p.id)
      const updatePromises = promptIds.map(promptId => 
        actions.updatePrompt(promptId, { visibility })
          .catch(error => {
            console.error(`Error updating prompt ${promptId} visibility:`, error)
            // Don't throw, just log the error so other prompts can still be updated
          })
      )
      
      await Promise.all(updatePromises)
      
      toast.success(`Collection and ${promptIds.length} prompt(s) updated to ${visibility}`)
    } catch (error) {
      console.error("Error updating collection visibility:", error)
      toast.error("Failed to update collection visibility")
    }
  }

  const handleCopyLink = () => {
    if (!selectedCollection) return
    
    const link = `${window.location.origin}/prompt/${selectedCollection.id}`
    navigator.clipboard.writeText(link)
    toast.success("Link copied to clipboard")
  }

  const getVisibilityDescription = () => {
    switch (selectedCollection?.visibility) {
      case "public":
        return "Anyone with the link can view and save this collection"
      case "unlisted":
        return "Only people you&apos;ve shared with can view this collection"
      default:
        return "Only you can view this collection"
    }
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
      {(showRenameDialog || showAddPromptDialog || showShareDialog) && (
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
          display: showRenameDialog || showAddPromptDialog || showShareDialog ? "none" : "flex",
          flexDirection: "column",
          gap: 2,
          transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Add Prompt Button - only for owners */}
        {userRole === "owner" && (
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
        )}

        {/* Share Button - only for owners */}
        {userRole === "owner" && selectedCollection && (
          <button
            className="flex items-center gap-2 text-left text-sm text-white hover:bg-[var(--wisp-blue)]/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
            onClick={(e) => {
              if (e && e.nativeEvent) {
                const mouseX = e.nativeEvent.clientX
                const mouseY = e.nativeEvent.clientY
                openShareDialog(mouseX, mouseY)
              } else {
                openShareDialog(window.innerWidth / 2, window.innerHeight / 2)
              }
            }}
          >
            <Share size={16} />
            Share
          </button>
        )}

        {/* Rename Button - only for owners */}
        {userRole === "owner" && (
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
        )}

        <button
          className="flex items-center gap-2 text-left text-sm text-red-400 hover:bg-red-400/10 rounded-md px-4 py-2 transition-colors cursor-pointer font-medium"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          {userRole === "owner" ? "Delete" : "Remove from Library"}
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
      {showShareDialog && sharePosition && selectedCollection && (
        <div
          id="share-dialog"
          style={{
            position: "fixed",
            left: sharePosition.x,
            top: sharePosition.y,
            zIndex: 200,
            background: "var(--deep-charcoal)",
            border: "1px solid var(--wisp-blue)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            padding: "18px 22px",
            minWidth: 320,
            minHeight: 280,
            maxHeight: 400,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--moonlight-silver-bright)]">Share this collection</h4>
              <p className="text-sm text-[var(--moonlight-silver)]/80">{getVisibilityDescription()}</p>
            </div>

            <div className="space-y-3">
              {/* Private Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="private"
                  name="visibility"
                  checked={selectedCollection.visibility === "private"}
                  onChange={() => handleVisibilityChange("private")}
                  className="mt-1 accent-[var(--wisp-blue)]"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="private"
                    className="text-[var(--moonlight-silver)] flex items-center gap-2 cursor-pointer"
                  >
                    <Lock size={14} />
                    Private
                  </label>
                  <p className="text-xs text-[var(--moonlight-silver)]/60">Only you can see this collection</p>
                </div>
              </div>

              {/* Unlisted Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="unlisted"
                  name="visibility"
                  checked={selectedCollection.visibility === "unlisted"}
                  onChange={() => handleVisibilityChange("unlisted")}
                  className="mt-1 accent-[var(--wisp-blue)]"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="unlisted"
                    className="text-[var(--moonlight-silver)] flex items-center gap-2 cursor-pointer"
                  >
                    <Users size={14} />
                    Unlisted
                  </label>
                  <p className="text-xs text-[var(--moonlight-silver)]/60">
                    Only people you&apos;ve shared with can view
                  </p>
                </div>
              </div>

              {/* Public Option */}
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="public"
                  name="visibility"
                  checked={selectedCollection.visibility === "public"}
                  onChange={() => handleVisibilityChange("public")}
                  className="mt-1 accent-[var(--wisp-blue)]"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="public"
                    className="text-[var(--moonlight-silver)] flex items-center gap-2 cursor-pointer"
                  >
                    <Globe size={14} />
                    Public
                  </label>
                  <p className="text-xs text-[var(--moonlight-silver)]/60">
                    Anyone with the link can view and save
                  </p>
                </div>
              </div>
            </div>

            {/* Copy Link Button */}
            {(selectedCollection.visibility === "public" || selectedCollection.visibility === "unlisted") && (
              <div className="pt-2 border-t border-[var(--moonlight-silver-dim)]/20">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent border-[var(--moonlight-silver-dim)]/30 text-[var(--moonlight-silver)] hover:bg-[var(--wisp-blue)]/10 hover:text-[var(--wisp-blue)] hover:border-[var(--wisp-blue)]/30"
                >
                  <LinkIcon size={14} className="mr-2" />
                  Copy Link
                </Button>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                className="rounded px-4 py-2 text-gray-300 hover:bg-gray-700"
                onClick={() => closeShareDialog(true)}
              >
                Close
              </Button>
            </div>
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
