import Navbar from '@/components/navbar';
import { createClient } from '../../../lib/utils/supabase/server'
import { AppProvider } from '@/contexts/appContext';

export default async function PromptLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[var(--black)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">Please log in</h2>
          <p className="text-[var(--moonlight-silver)]">You need to be logged in to access prompts.</p>
        </div>
      </div>
    )
  }

  // This layout provides the sidebar and midbar navigation for all prompt pages
  return (
      <div className="min-h-screen bg-[var(--black)] w-full">
        <div className="h-screen">
          <div className="flex gap-0 h-full">
            <AppProvider>
            <Navbar>
              {children}
            </Navbar>
            </AppProvider>
          </div>
        </div>
      </div>
  )
}
