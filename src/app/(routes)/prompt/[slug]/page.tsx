import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PromptSlugPage from '@/components/pages/prompt/promptSlug'
import { createClient } from '@/lib/utils/supabase/server'
import Prompt from '@/lib/models/prompt'

interface PromptPreviewProps {
  params: Promise<{
    slug: string
  }>
}

// Helper function to get prompt by ID (treating slug as ID since we removed slug)
async function getPromptById(id: string, userId?: string) {
  try {
    const supabase = await createClient()
    
    // First try to get the prompt including deleted ones
    const { data: prompt, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !prompt) {
      return null
    }
    
    // Check if user has access to this prompt
    // Allow access if:
    // 1. Prompt is public, OR
    // 2. User is the owner (including deleted prompts), OR  
    // 3. User is a collaborator
    const hasAccess = 
      prompt.visibility === 'public' || 
      prompt.user_id === userId ||
      (prompt.collaborators && prompt.collaborators.includes(userId))
    
    if (!hasAccess) {
      return null
    }
    
    // Check if user has favorited this prompt (stored in user favorites array)
    let isFavorite = false
    let isSaved = false
    
    if (userId) {
      // Get user data to check favorites and bought items
      const { data: userData } = await supabase
        .from('users')
        .select('favorites, bought')
        .eq('id', userId)
        .single()
      
      isFavorite = userData?.favorites?.includes(prompt.id) || false
      
      // For non-owned prompts, check if it's in user's saved/bought prompts
      if (prompt.user_id !== userId) {
        isSaved = userData?.bought?.includes(prompt.id) || false
      }
    }
    
    // Get profile information from users table
    const { data: profile } = await supabase
      .from('users')
      .select('username, name, profile_picture')
      .eq('id', prompt.user_id)
      .single()
    
    return {
      ...prompt,
      is_favorite: isFavorite,
      is_saved: isSaved,
      is_owner: prompt.user_id === userId,
      profile: profile ? {
        username: profile.username,
        full_name: profile.name,
        avatar_url: profile.profile_picture
      } : null
    }
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PromptPreviewProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const prompt = await getPromptById(slug, user?.id)
    
    if (!prompt) {
      return {
        title: 'Prompt Not Found | Prompt Wisp',
        description: 'The requested prompt could not be found',
      }
    }
    
    // Special handling for deleted prompts
    if (prompt.deleted) {
      return {
        title: `${prompt.title} (Deleted) | Prompt Wisp`,
        description: prompt.description || `View deleted prompt: ${prompt.title}`,
      }
    }
    
    return {
      title: `${prompt.title} | Prompt Wisp`,
      description: prompt.description || `View and edit prompt: ${prompt.title}`,
    }
  } catch {
    return {
      title: 'Prompt Not Found | Prompt Wisp',
      description: 'The requested prompt could not be found',
    }
  }
}

export default async function PromptPreview({ params }: PromptPreviewProps) {
  const { slug } = await params
  
  // Validate slug format - treating it as prompt ID
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get prompt data from database
  const promptData = await getPromptById(slug, user?.id)

  if (!promptData) {
    notFound()
  }

  return <PromptSlugPage slug={slug} promptData={promptData} user={{ id: user?.id || '', email: user?.email }} />
}