'use client'

import { type User } from '@supabase/supabase-js'
import PromptHome from '@/components/promptHome'
import PromptPreview from '@/components/promptPreview'

interface PromptPageProps {
  user: User
}

export default function PromptPage({
  user,
}: PromptPageProps) {
  return (
    <PromptHome user={user} />
  )
}
