"use client"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import PromptEdit from "@/components/prompt-edit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, FileX } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/appContext"
import type { PromptData } from "@/lib/models/prompt"
import Prompt from "@/lib/models/prompt"

export default function PromptSlug() {
  const params = useParams();
  const { slug } = params;
  const { state, actions, utils } = useApp()
  const { prompts, user } = state

  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate slug format - treating it as prompt ID
  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      notFound()
      return
    }

    // Initialize prompt data and check permissions
    const initializePrompt = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Wait for prompts to load if they haven't already
        if (state.loading.prompts) {
          return
        }

        // Try to find prompt in loaded prompts first
        let prompt = prompts.find((p) => p.id === slug) || null

        // If not found in loaded prompts, try to fetch it directly
        if (!prompt) {
          try {
            prompt = await Prompt.findById(slug)
          } catch (fetchError) {
            console.error("Error fetching prompt:", fetchError)
            setError("Failed to load prompt")
          }
        }

        // Check if user can edit (optional: implement real permission check)
        setCanEdit(true)

        if (!prompt) {
          setPromptFound(false)
          setIsLoading(false)
          return
        }

        setSelectedPrompt(prompt)
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
  }, [slug, prompts, state.loading.prompts, user?.id, actions, utils])

  // Loading skeleton
  if (isLoading || state.loading.prompts) {
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

  // Prompt not found or access denied
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
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">
                {error ? "Access Denied" : "Prompt Not Found"}
              </h3>
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

  if (!selectedPrompt) return null

  // Show edit component for users with edit permissions
  if (canEdit) {
    return (
      <PromptEdit
        selectedPrompt={selectedPrompt}
      />
    )
  }

  // Show preview component for read-only access
  return (
    <div>
      You do not have permission to edit this prompt.
    </div>
  )
}

