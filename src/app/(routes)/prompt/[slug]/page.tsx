import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PromptSlugPage from '@/components/pages/prompt/promptSlug'
import { createClient } from '@/lib/utils/supabase/server'
import Prompt from '@/lib/models/prompt'

interface PromptSlugProps {
  params: Promise<{
    slug: string
  }>
}

// Helper function to get prompt by slug
async function getPromptBySlug(slug: string, userId?: string) {
  try {
    const prompt = await Prompt.findBySlug(slug)
    
    if (!prompt) {
      return null
    }
    
    // Check if user has access to this prompt
    if (!prompt.is_public && prompt.user_id !== userId) {
      return null
    }
    
    // Add additional metadata for the component
    const supabase = await createClient()
    
    // Check if user has favorited this prompt
    let isFavorite = false
    let isSaved = false
    
    if (userId) {
      const { data: favorite } = await supabase
        .from('user_favorite_prompts')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', prompt.id)
        .single()
      
      isFavorite = !!favorite
      
      // Check if saved (only for prompts not owned by user)
      if (prompt.user_id !== userId) {
        const { data: saved } = await supabase
          .from('user_saved_prompts')
          .select('id')
          .eq('user_id', userId)
          .eq('prompt_id', prompt.id)
          .single()
        
        isSaved = !!saved
      }
    }
    
    // Get profile information
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', prompt.user_id)
      .single()
    
    return {
      ...prompt,
      is_favorite: isFavorite,
      is_saved: isSaved,
      is_owner: prompt.user_id === userId,
      profile
    }
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PromptSlugProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const prompt = await getPromptBySlug(slug)
    
    if (!prompt || prompt.is_deleted) {
      return {
        title: 'Prompt Not Found | Prompt Wisp',
        description: 'The requested prompt could not be found',
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

export default async function PromptSlug({ params }: PromptSlugProps) {
  const { slug } = await params
  
  // Validate slug format if needed
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get prompt data from database
  const promptData = await getPromptBySlug(slug, user?.id)

  if (!promptData) {
    notFound()
  }

  return <PromptSlugPage slug={slug} promptData={promptData} />
}