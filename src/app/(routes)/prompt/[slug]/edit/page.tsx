import { createClient } from '@/lib/utils/supabase/server'
import PromptSlugPage from '@/components/pages/prompt/promptSlug'
import { redirect } from 'next/navigation'

interface PromptEditPageProps {
  params: Promise<{ slug: string }>
}

export default async function PromptEditPage({ params }: PromptEditPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Fetch the specific prompt to check if user can edit it
  let promptData = null
  try {
    console.log('Fetching prompt with slug:', slug)
    
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', slug)
      .single()

    if (error) {
      console.error('Error fetching prompt:', error)
    } else {
      promptData = data
    }
  } catch (error) {
    console.error('Error in prompt fetch:', error)
  }

  // Check if user can edit this prompt
  const canEdit = promptData && (
    promptData.user_id === user.id || 
    (promptData.collaborators && promptData.collaborators.includes(user.id))
  ) && !promptData.deleted

  // If user cannot edit, redirect to view mode
  if (!canEdit) {
    redirect(`/prompt/${slug}`)
  }

  return (
    <PromptSlugPage 
      slug={slug} 
      promptData={promptData}
      user={{ id: user.id, email: user.email || undefined }}
      forceEditMode={true}
    />
  )
}
