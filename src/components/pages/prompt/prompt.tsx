'use client'

import { type User } from '@supabase/supabase-js'
import PromptHome from '@/components/promptHome'
import PromptPreview from '@/components/promptPreview'
import { usePromptContext } from '@/components/promptContext'

interface PromptPageProps {
  user: User
}

export default function PromptPage({
  user,
}: PromptPageProps) {
  const { activeFilter } = usePromptContext()
  
  // Show PromptPreview when any filter other than 'all' (Home) is active
  if (activeFilter !== 'all') {
    return <PromptPreview />
  }
  
  return (
    <PromptHome user={user} />
  )
}
