"use client"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import PromptEdit from "@/components/prompt-edit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, FileX, Lock, Eye, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/appContext"
import Prompt from "@/lib/models/prompt"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { UsersPrompts } from "@/lib/models"
import { user_role } from "@/lib/models/usersPrompts"

export default function PromptSlug() {
  const params = useParams()
  const { slug } = params
  const { state, actions } = useApp()
  const { user } = state

  const { selectedPrompt } = state.ui
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<user_role | null>(null)

  // Validate slug format - treating it as prompt ID
  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      notFound()
      return
    }

    if (!user){
      return
    }

    // Initialize prompt data and check permissions
    const initializePrompt = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const prompt = await Prompt.findById(slug)

        if (!prompt) {
          setPromptFound(false)
          setIsLoading(false)
          return
        }

        // Check permissions based on visibility and user access
        setRole(state.userRoles.prompts[slug] || await UsersPrompts.getUserRole(slug, user.id))
        actions.setSelectedPrompt(prompt)
        setPromptFound(true)
      } catch (error) {
        console.error("Error initializing prompt:", error)
        setError("An error occurred while loading the prompt")
        setPromptFound(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializePrompt()
  }, [slug, user?.id, user])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen p-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-8 bg-[var(--slate-grey)]/30 rounded w-32"></div>
              <div className="h-6 bg-[var(--slate-grey)]/20 rounded w-20"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20"></div>
              <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20"></div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-3/4"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/2"></div>
            <div className="h-32 bg-[var(--slate-grey)]/20 rounded w-full"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-2/3"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  // Prompt not found
  if (!promptFound || error) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center bg-[var(--slate-grey)]/20">
                  <FileX className="h-8 w-8 text-[var(--moonlight-silver)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">Prompt Not Found</h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                {error || "The prompt you're looking for doesn't exist or may have been removed."}
              </p>
              <Link href="/prompt">
                <Button
                  size="lg"
                  className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-semibold gap-2"
                >
                  <Home size={16} />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  // Access denied
  if (
    (selectedPrompt?.visibility !== "public" && !role) ||
    (selectedPrompt?.visibility === "private" && role !== "owner")
  ) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center bg-[var(--slate-grey)]/20">
                  <Lock className="h-8 w-8 text-[var(--moonlight-silver)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">Access Denied</h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                {"You don't have permission to view this prompt."}
              </p>
              <Link href="/prompt">
                <Button
                  size="lg"
                  className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-semibold gap-2"
                >
                  <Home size={16} />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!selectedPrompt) return null

  // Show edit component for users with edit permissions
  if (role === "owner") {
    return <PromptEdit selectedPrompt={selectedPrompt} />
  }

  // Show read-only view for users with view-only access
  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--moonlight-silver-dim)]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[var(--moonlight-silver)]" />
            <h1 className="text-xl font-semibold text-[var(--moonlight-silver-bright)]">View Prompt</h1>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--moonlight-silver)]/60">
            <Lock size={14} />
            Read-only
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          {!role && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await actions.savePrompt(selectedPrompt.id)
                  toast.success("Prompt saved to your library")
                  setRole(state.userRoles.prompts[selectedPrompt.id]) // Set role to owner after saving
                } catch {
                  toast.error("Failed to save prompt")
                }
                actions.loadPrompts() // Refresh prompts after saving
                actions.loadUserRelationships()
                actions.setSelectedPrompt(selectedPrompt)
              }}
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Save size={16} />
            </Button>
          )}
          {role && (
            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    try {
                                      await actions.deletePrompt(selectedPrompt.id)
                                      toast.success("Prompt moved to Recently Deleted")
                                      setRole(null)
                                    } catch {
                                      toast.error("Failed to delete prompt")
                                    }
                                      actions.loadPrompts() // Refresh prompts after saving
                                      actions.loadUserRelationships()
                                  }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 size={16} />
                              </Button>
          )}
          {/* Back to Home */}
          <Link href="/prompt">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Home size={16} />
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
                    <Textarea
                      variant="editor"
                      id="title"
                      value={selectedPrompt.title || "This prompt doesnt have a title yet"}
                      disabled
                      placeholder="New Prompt"
                      className="text-4xl font-bold border-none p-0 resize-none overflow-hidden bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px]"
                      rows={1}
                      style={{ lineHeight: 1.2 }}
                    />

          {/* Description */}
          {selectedPrompt.description && (
                      <Textarea
                        variant="editor"
                        id="description"
                        value={selectedPrompt.description}
                        disabled
                        placeholder="Enter prompt description..."
                        className="text-sm text-[var(--moonlight-silver)] border-none pb-8 resize-none overflow-hidden bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px]"
                        rows={1}
                        style={{ lineHeight: 1.3 }}
                      />
          )}

          {/* Prompt Content */}
          <Textarea
            variant="editor"
            id="content"
            value={selectedPrompt.content || "This prompt doesnt have any content"}
            placeholder="Enter prompt..."
            disabled
            className="disbled text-md font-bold text-gray-300 border-none pb-4 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[180px] overflow-hidden h-full"
          />

          {/* Tags */}
          {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedPrompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)] border-[var(--wisp-blue)]/30 rounded-full px-3 py-1 text-sm font-medium gap-1"
                >
                  <span className="text-[var(--wisp-blue)] font-bold">#</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--moonlight-silver)]/60 pt-4 border-t border-[var(--moonlight-silver-dim)]/20">
            <div>Created: {new Date(selectedPrompt.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(selectedPrompt.updated_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
