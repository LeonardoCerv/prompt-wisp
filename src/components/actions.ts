"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/server"

export async function signout() {
  const supabase = await createClient()

  // type-casting here for convenience
  const { error } = await supabase.auth.signOut({ scope: "local" })

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/")
}