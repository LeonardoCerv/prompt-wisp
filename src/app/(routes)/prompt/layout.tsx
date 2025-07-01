import type React from "react"
import Navbar from "@/components/navbar"
import { createClient } from "../../../lib/utils/supabase/server"
import { AppProvider } from "@/contexts/appContext"
import { redirect } from "next/navigation"

export default async function PromptLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/signup")
  }

  // This layout provides the sidebar and midbar navigation for all prompt pages
  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-screen">
        <div className="flex gap-0 h-full">
          <AppProvider>
            <Navbar>{children}</Navbar>
          </AppProvider>
        </div>
      </div>
    </div>
  )
}
