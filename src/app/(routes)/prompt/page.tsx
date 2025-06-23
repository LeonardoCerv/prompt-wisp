import PromptPage from '@/components/pages/prompt/prompt'
import { createClient } from '@/lib/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Prompt() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if user is not authenticated
  if (!user) {
    redirect('/login')
  }

  return (
      <PromptPage user={user} />
  )
}