import { notFound } from "next/navigation"
import type { Metadata } from "next"
import PromptSlugPage from "@/components/pages/prompt/promptSlug"
import { createClient } from "@/lib/utils/supabase/server"

interface PromptPreviewProps {
  params: Promise<{
    slug: string
  }>
}

// Simple metadata generation - the component will handle the actual data fetching
export async function generateMetadata({ params }: PromptPreviewProps): Promise<Metadata> {
  const { slug } = await params

  // Basic metadata - the component will handle the detailed logic
  return {
    title: "Prompt | Prompt Wisp",
    description: "View and edit prompts on Prompt Wisp",
  }
}

export default async function PromptPreview({ params }: PromptPreviewProps) {
  const { slug } = await params

  // Validate slug format - treating it as prompt ID
  if (!slug || typeof slug !== "string") {
    notFound()
  }

  // Get user info from server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Pass minimal data to component - let it handle the rest
  return (
    <PromptSlugPage
      slug={slug}
      user={{
        id: user?.id || "",
        email: user?.email,
      }}
    />
  )
}
