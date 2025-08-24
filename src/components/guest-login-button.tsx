"use client"

import { Button } from "@/components/ui/button"
import { loginAsGuest } from "@/app/(routes)/login/actions"
import { useActionState } from "react"
import { useRouter } from "next/navigation"

export default function GuestLoginButton() {
  const [state, formAction] = useActionState(loginAsGuest, {})
  const router = useRouter()
  
    if (state?.success === true) {
        router.push("/prompt")
    }

  return (
    <form action={formAction} className="inline-block">
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="border-[var(--wisp-blue)] text-gray-200 hover:bg-zinc-800 text-lg p-6 mr-4 bg-transparent border-2"
      >
        Try as Guest
      </Button>
      {state?.errors?._form && (
        <p className="text-red-500 text-sm mt-2">{state.errors._form[0]}</p>
      )}
    </form>
  )
}
