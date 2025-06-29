"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Dialog from "@/components/ui/dialog"
import {
  FolderOpen,
  Star,
  FileText,
  Camera,
  Users,
  Lock,
  Link,
  Globe,
  Hash,
  Plus,
  ArrowLeft,
  Check,
  Save,
  Upload,
  X,
} from "lucide-react"
import Image from "next/image"
import type { CollectionInsert } from "@/lib/models"
import { useApp } from "@/contexts/appContext"

interface NewCollectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (collection: CollectionInsert) => Promise<void>
}

export default function NewCollection({ open, onOpenChange, onSubmit }: NewCollectionProps) {
  const { state } = useApp()

  // Get prompts that user has access to
  const availablePrompts = state.prompts.filter((p) => !p.deleted && state.userPrompts.includes(p.id))

  const [formData, setFormData] = useState<CollectionInsert>({
    title: "",
    description: "",
    tags: [],
    visibility: "private",
    images: [],
  })

  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { id: 1, title: "Essentials", icon: Star, required: true },
    { id: 2, title: "Details", icon: FileText, required: false },
    { id: 3, title: "Advanced", icon: Users, required: false },
    { id: 4, title: "Ready", icon: Check, required: false },
  ]

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      tags: [],
      visibility: "private",
      images: [],
    })
    setSelectedPromptIds([])
    setCurrentStep(1)
    setUploadError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Submit the collection data
      await onSubmit(formData)

      // Note: Adding prompts to collection would need to be handled separately
      // after the collection is created, using the collection ID

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating collection:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof CollectionInsert, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const result = await response.json()
        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }))
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, index) => index !== indexToRemove),
    }))
  }

  const addImageUrl = (url: string) => {
    if (url.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), url.trim()],
      }))
    }
  }

  const isValid = formData.title.trim()
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim()
      case 2:
      case 3:
      case 4:
        return true // Optional steps are always valid
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipToEnd = () => {
    setCurrentStep(currentStep + 1)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog isOpen={open} onClose={handleClose} title="" maxWidth="max-w-3xl">
      <div className="max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--wisp-blue)]/20 rounded-full flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[var(--wisp-blue)]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Create New Collection</h3>
                <p className="text-sm text-[var(--flare-cyan)]/80">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>

            {/* Compact Progress Steps */}
            <div className="flex items-center gap-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-none ${
                      currentStep === step.id
                        ? "border-[var(--wisp-blue)] text-[var(--wisp-blue)]"
                        : "border-[var(--moonlight-silver)]/10 text-[var(--moonlight-silver)]/50"
                    }`}
                  >
                    <step.icon size={18} />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${"bg-[var(--moonlight-silver)]/20"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Essentials */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-medium text-white mb-2">Collection Basics</h4>
                  <p className="text-sm text-[var(--flare-cyan)]/80">
                    Start with the essential information for your collection
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[var(--warning-amber)]" />
                      <Label htmlFor="title" className="text-sm font-medium text-white">
                        Collection Name *
                      </Label>
                    </div>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Enter a name for your collection..."
                      className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300"
                      required
                    />
                  </div>

                  {availablePrompts.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[var(--warning-amber)]" />
                          <Label className="text-sm font-medium text-white">Available Prompts</Label>
                        </div>
                        <span className="text-xs text-[var(--flare-cyan)]/70">{selectedPromptIds.length} selected</span>
                      </div>

                      <div className="max-h-80 overflow-y-auto space-y-2 bg-white/5 rounded-lg p-3 border border-[var(--flare-cyan)]/20">
                        {availablePrompts.map((prompt) => {
                          const isSelected = selectedPromptIds.includes(prompt.id)
                          return (
                            <div
                              key={prompt.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "bg-[var(--wisp-blue)]/20 border-[var(--wisp-blue)]/40 text-white"
                                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                              }`}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPromptIds((ids) => ids.filter((id) => id !== prompt.id))
                                } else {
                                  setSelectedPromptIds((ids) => [...ids, prompt.id])
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm truncate mb-1">{prompt.title}</h5>
                                  {prompt.description && (
                                    <p className="text-xs opacity-70 line-clamp-2 mb-2">{prompt.description}</p>
                                  )}
                                  {prompt.tags && prompt.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {prompt.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                          key={index}
                                          className="text-xs bg-[var(--flare-cyan)]/20 text-[var(--flare-cyan)] px-2 py-0.5 rounded"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                      {prompt.tags.length > 3 && (
                                        <span className="text-xs text-white/50">+{prompt.tags.length - 3} more</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`ml-3 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected ? "bg-[var(--wisp-blue)] border-[var(--wisp-blue)]" : "border-white/30"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <p className="text-xs text-[var(--flare-cyan)]/70">
                        Click on prompts to add or remove them from this collection
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--moonlight-silver)]/60">
                      <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No prompts available</p>
                      <p className="text-xs mt-1">Create some prompts first to add them to collections</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-medium text-white mb-2">Collection Details</h4>
                  <p className="text-sm text-[var(--flare-cyan)]/80">Add tags and images to enhance your collection</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--warning-amber)]" />
                      <Label htmlFor="description" className="text-sm font-medium text-white">
                        Description
                      </Label>
                    </div>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe what this collection is about..."
                      className="min-h-[80px] bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[var(--warning-amber)]" />
                      <Label htmlFor="tags" className="text-sm font-medium text-white">
                        Tags
                      </Label>
                    </div>
                    <Input
                      id="tags"
                      value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags}
                      onChange={(e) => {
                        const value = e.target.value
                        const tagsArray = value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                        handleChange("tags", tagsArray)
                      }}
                      placeholder="coding, templates, productivity..."
                      className="bg-white/10 border-[var(--flare-cyan)]/50 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                    />
                    <p className="text-xs text-[var(--flare-cyan)]/70">
                      Add tags to help organize and find your collection
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[var(--warning-amber)]" />
                      <Label htmlFor="images" className="text-sm font-medium text-white">
                        Cover Images
                      </Label>
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-2 border-[var(--flare-cyan)]/50 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300"
                        >
                          <Upload className="w-4 h-4" />
                          {isUploading ? "Uploading..." : "Upload Images"}
                        </Button>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>

                      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

                      {/* URL Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Or paste image URL..."
                          className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              addImageUrl(input.value)
                              input.value = ""
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector(
                              "input",
                            ) as HTMLInputElement
                            if (input) {
                              addImageUrl(input.value)
                              input.value = ""
                            }
                          }}
                          className="border-[var(--flare-cyan)]/50 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {Array.isArray(formData.images) && formData.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-[var(--flare-cyan)]/70">
                          {formData.images.length} image{formData.images.length !== 1 ? "s" : ""} added:
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {(formData.images || []).map((url, index) => (
                            <div key={index} className="relative group">
                              <Image
                                width={24}
                                height={24}
                                src={url || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-16 object-cover rounded border border-[var(--flare-cyan)]/30"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  const parent = target.parentElement
                                  if (parent) {
                                    const errorDiv = document.createElement("div")
                                    errorDiv.className =
                                      "w-full h-16 bg-white/5 border border-red-400/50 rounded flex items-center justify-center text-xs text-red-400"
                                    errorDiv.textContent = "Failed to load"
                                    parent.appendChild(errorDiv)
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[var(--flare-cyan)]/70">
                      Add cover images for your collection (max 5MB per file)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Advanced */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-medium text-white mb-2">Advanced Settings</h4>
                  <p className="text-sm text-[var(--flare-cyan)]/80">Set visibility for your collection</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--warning-amber)]" />
                      <Label htmlFor="visibility" className="text-sm font-medium text-white">
                        Visibility
                      </Label>
                    </div>
                    <select
                      id="visibility"
                      value={formData.visibility}
                      onChange={(e) => handleChange("visibility", e.target.value as "public" | "private" | "unlisted")}
                      className="w-full px-3 py-2.5 bg-white/10 border border-[var(--flare-cyan)]/50 text-white rounded-md focus:outline-none focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                    >
                      <option value="private">Private (only you can see)</option>
                      <option value="unlisted">Unlisted (accessible via link)</option>
                      <option value="public">Public (visible to everyone)</option>
                    </select>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--flare-cyan)]/70">
                      {formData.visibility === "private" && (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Only you can see this collection</span>
                        </>
                      )}
                      {formData.visibility === "unlisted" && (
                        <>
                          <Link className="w-3 h-3" />
                          <span>Accessible via direct link only</span>
                        </>
                      )}
                      {formData.visibility === "public" && (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Visible to everyone in the marketplace</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6">
                    <Image
                      width={96}
                      height={96}
                      src="/wisp.svg"
                      alt="Wisp Mascot"
                      className="w-24 h-24 opacity-90 drop-shadow-[0_0_12px_rgba(14,165,233,0.4)]"
                    />
                  </div>
                  <h4 className="text-xl font-medium text-white mb-3">Collection Ready!</h4>
                  <p className="text-sm text-[var(--flare-cyan)]/80 max-w-md mx-auto leading-relaxed">
                    Your collection has been configured and is ready to be created. You can start organizing your
                    prompts right away!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white/8 to-[var(--flare-cyan)]/5 border border-[var(--flare-cyan)]/30 rounded-xl p-6 space-y-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--wisp-blue)]/20 border border-[var(--wisp-blue)]/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[var(--wisp-blue)]" />
                    </div>
                    <h5 className="text-base font-semibold text-white">Collection Summary</h5>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[var(--warning-amber)]" />
                        <span className="text-sm text-white/80">Name:</span>
                      </div>
                      <span className="text-sm text-white font-medium max-w-[200px] truncate" title={formData.title}>
                        {formData.title || "Untitled Collection"}
                      </span>
                    </div>

                    {formData.description && (
                      <div className="flex items-start justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--warning-amber)] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-white/80">Description:</span>
                        </div>
                        <span className="text-sm text-white/90 max-w-[200px] text-right" title={formData.description}>
                          {formData.description.length > 40
                            ? `${formData.description.slice(0, 40)}...`
                            : formData.description}
                        </span>
                      </div>
                    )}

                    {formData.tags && Array.isArray(formData.tags) && formData.tags.length > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-[var(--warning-amber)]" />
                          <span className="text-sm text-white/80">Tags:</span>
                        </div>
                        <span className="text-sm text-white/90 max-w-[200px] truncate" title={formData.tags.join(", ")}>
                          {formData.tags.join(", ")}
                        </span>
                      </div>
                    )}

                    {Array.isArray(formData.images) && formData.images.length > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[var(--warning-amber)]" />
                          <span className="text-sm text-white/80">Images:</span>
                        </div>
                        <span className="text-sm text-[var(--flare-cyan)] font-medium">
                          {formData.images.length} image{formData.images.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {selectedPromptIds.length > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[var(--warning-amber)]" />
                          <span className="text-sm text-white/80">Prompts:</span>
                        </div>
                        <span className="text-sm text-[var(--flare-cyan)] font-medium">
                          {selectedPromptIds.length} prompt{selectedPromptIds.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[var(--warning-amber)]" />
                        <span className="text-sm text-white/80">Visibility:</span>
                      </div>
                      <span className="text-sm text-[var(--flare-cyan)] capitalize font-medium">
                        {formData.visibility}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 pt-6 mt-4 border-t border-[var(--flare-cyan)]/20 px-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2 border-white/50 text-white/70 hover:bg-white/5 hover:border-white hover:text-white transition-all duration-300 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-[var(--flare-cyan)]/60 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300 bg-transparent"
              >
                Cancel
              </Button>
            </div>

            {/* Progress Bar - Centered between buttons */}
            <div className="flex justify-center">
              <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--wisp-blue)] to-[var(--flare-cyan)] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(14,165,233,0.8)]"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {(currentStep === 2 || currentStep === 3) && !steps[currentStep - 1].required && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={skipToEnd}
                  className="text-gray-300/70 hover:text-white hover:shadow-lg duration-300"
                >
                  Skip
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  disabled={!isStepValid(currentStep)}
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {currentStep === 3 ? "Review" : "Next"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Collection!
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
