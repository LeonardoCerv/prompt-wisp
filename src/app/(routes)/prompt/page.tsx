'use server'

import PromptPage from '@/components/pages/prompt/prompt'
import { createClient } from '../../../lib/utils/supabase/server'

export default async function Prompt() {
  const supabase = await createClient()
  
  const {
      data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--black)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">Please log in</h2>
          <p className="text-[var(--moonlight-silver)]">You need to be logged in to access prompts.</p>
        </div>
      </div>
    )
  }

  return (
    <PromptPage user={user}/>
  )
}