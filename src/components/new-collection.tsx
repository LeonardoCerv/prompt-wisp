"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Dialog from "@/components/ui/dialog"
import type { CollectionInsert } from "@/lib/models"

interface NewCollectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (collection: CollectionInsert) => Promise<void>
}

export default function NewCollection({ open, onOpenChange, onSubmit }: NewCollectionProps) {
  const [formData, setFormData] = useState<CollectionInsert>({
    title: "",
    description: "",
    tags: [],
    visibility: "private",
    images: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof CollectionInsert, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        tags: [],
        visibility: "private",
        images: [],
      })
      onOpenChange(false)
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      tags: [],
      visibility: "private",
      images: [],
    })
    onOpenChange(false)
  }

  return (
    <Dialog isOpen={open} onClose={handleClose} title="" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6 p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Create New Collection</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-white">
              Collection Name *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter a name for your collection..."
              required
              className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300"
            />
          </div>
          <div>
            <Label htmlFor="visibility" className="text-sm font-medium text-white">
              Visibility
            </Label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => handleChange("visibility", e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-[var(--flare-cyan)]/50 text-white rounded-md focus:outline-none focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
            >
              <option value="private">Private (only you can see)</option>
              <option value="unlisted">Unlisted (accessible via link)</option>
              <option value="public">Public (visible to everyone)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-[var(--flare-cyan)]/60 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.title.trim() || isSubmitting}
            className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Collection"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
