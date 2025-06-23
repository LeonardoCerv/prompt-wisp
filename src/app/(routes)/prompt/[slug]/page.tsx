import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PromptSlugPage from '@/components/pages/prompt/promptSlug'

interface PromptSlugProps {
  params: {
    slug: string
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PromptSlugProps): Promise<Metadata> {
  const { slug } = params
  
  // In a real app, you would fetch the prompt data here to generate proper metadata
  // const prompt = await fetchPromptFromDatabase(slug)
  
  return {
    title: `Prompt ${slug} | Prompt Wisp`,
    description: `View and edit prompt ${slug}`,
  }
}

// This could be enhanced to fetch from database in the future
async function getPrompt(slug: string) {
  // For now, we'll let the client-side handle the lookup
  // In a real app, this would fetch from your database
  // const prompt = await fetchPromptFromDatabase(slug)
  // if (!prompt) {
  //   notFound()
  // }
  // return prompt
  return { slug }
}

export default async function PromptSlug({ params }: PromptSlugProps) {
  const { slug } = params
  
  // Validate slug format if needed
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  // Get prompt data (currently just passing slug, but could be enhanced)
  const promptData = await getPrompt(slug)

  return <PromptSlugPage slug={slug} />
}