import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PromptSlugPage from '@/components/pages/prompt/promptSlug'
import { createClient } from '@/lib/utils/supabase/server'

interface PromptSlugProps {
  params: {
    slug: string
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PromptSlugProps): Promise<Metadata> {
  const { slug } = params
  
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
  } catch (error) {
    return {
      title: 'Prompt Not Found | Prompt Wisp',
      description: 'The requested prompt could not be found',
    }
  }
}

// Fetch prompt data from database
async function getPrompt(slug: string, userId?: string) {
  try {
    const prompt = await getPromptBySlug(slug, userId)
    
    if (!prompt) {
      return null
    }
    
    // Check if user has access to this prompt
    if (!prompt.is_public && prompt.user_id !== userId) {
      return null
    }
    
    return prompt
  } catch (error) {
    console.error('Error fetching prompt:', error)
    return null
  }
}

export default async function PromptSlug({ params }: PromptSlugProps) {
  const { slug } = params
  
  // Validate slug format if needed
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get prompt data from database
  const promptData = await getPrompt(slug, user?.id)

  if (!promptData) {
    notFound()
  }

  return <PromptSlugPage slug={slug} promptData={promptData} />
}