import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Dialog from "@/components/ui/dialog"
import UserSearchDropdown from "@/components/userSearchDropdown"
import { Camera, Plus, Save, X } from "lucide-react"
import { useApp } from "@/contexts/appContext"
import { UserData } from "@/lib/models"
import Image from "next/image"

interface EditCollectionDialogProps {
  open: boolean
  onClose: () => void
  initialData: {
    id: string
    title: string
    description: string
    tags: string
    visibility: string
    images: string[]
    collaborators: any[]
  }
}

export default function EditCollectionDialog({
  open,
  onClose,
  initialData
}: EditCollectionDialogProps) {
  const { actions } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadError(null)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }
        const result = await response.json()
        return result.url
      })
      const uploadedUrls = await Promise.all(uploadPromises)
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }

  const addImageUrl = (url: string) => {
    if (url.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, url.trim()] }))
    }
  }

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setIsSubmitting(true)
    try {
      await actions.editCollection && actions.editCollection(
        initialData.id || form.id,
        {
          ...form,
          tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          // Ensure visibility is one of the allowed values
          visibility: (['public', 'private', 'unlisted'].includes(form.visibility)
            ? form.visibility
            : 'private') as 'public' | 'private' | 'unlisted',
        }
      )
      onClose()
    } catch (error) {
      setUploadError('Failed to update collection')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog isOpen={open} onClose={onClose} title="Edit Collection" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="max-h-[85vh] flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-medium text-white mb-2">Edit Collection</h4>
              <p className="text-sm text-[var(--flare-cyan)]/80">Update your collection details below</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-title" className="text-sm font-medium text-white">Collection Name *</Label>
                </div>
                <Input
                  id="edit-title"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Enter a name for your collection..."
                  className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-description" className="text-sm font-medium text-white">Description</Label>
                </div>
                <Textarea
                  id="edit-description"
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Describe what this collection is about..."
                  className="min-h-[80px] bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300 resize-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-tags" className="text-sm font-medium text-white">Tags</Label>
                </div>
                <Input
                  id="edit-tags"
                  value={form.tags}
                  onChange={e => handleChange('tags', e.target.value)}
                  placeholder="coding, templates, productivity..."
                  className="bg-white/10 border-[var(--flare-cyan)]/50 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                />
                <p className="text-xs text-[var(--flare-cyan)]/70">Add tags to help organize and find your collection</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-images" className="text-sm font-medium text-white">Cover Images</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 border-[var(--flare-cyan)]/50 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Images
                    </Button>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-400">{uploadError}</p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Or paste image URL..."
                      className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          addImageUrl(input.value)
                          input.value = ''
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={e => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement
                        if (input) {
                          addImageUrl(input.value)
                          input.value = ''
                        }
                      }}
                      className="border-[var(--flare-cyan)]/50 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {form.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--flare-cyan)]/70">{form.images.length} image{form.images.length !== 1 ? 's' : ''} added:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {form.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-16 object-cover rounded border border-[var(--flare-cyan)]/30"
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const errorDiv = document.createElement('div')
                                errorDiv.className = 'w-full h-16 bg-white/5 border border-red-400/50 rounded flex items-center justify-center text-xs text-red-400'
                                errorDiv.textContent = 'Failed to load'
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
                <p className="text-xs text-[var(--flare-cyan)]/70">Add cover images for your collection (max 5MB per file)</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-visibility" className="text-sm font-medium text-white">Visibility</Label>
                </div>
                <select
                  id="edit-visibility"
                  value={form.visibility}
                  onChange={e => handleChange('visibility', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 border border-[var(--flare-cyan)]/50 text-white rounded-md focus:outline-none focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                >
                  <option value="private">Private (only you can see)</option>
                  <option value="unlisted">Unlisted (accessible via link)</option>
                  <option value="public">Public (visible to everyone)</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-collaborators" className="text-sm font-medium text-white">Collaborators</Label>
                </div>
                <UserSearchDropdown
                  selectedUsers={form.collaborators}
                  onUsersChange={users => handleChange('collaborators', users)}
                  placeholder="Search for collaborators..."
                  className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 pt-6 mt-4 border-t border-[var(--flare-cyan)]/20 px-6 pb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-[var(--flare-cyan)]/60 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!form.title.trim() || isSubmitting}
            className="flex items-center gap-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
