"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"
import { useState } from "react"
import { useActionState } from "react"
import { toast } from "sonner"

import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined)
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check if this is being opened by a web extension
  const [isExtensionMode, setIsExtensionMode] = useState(false)

  useEffect(() => {
    // Check if opened by extension (via URL parameter or window.opener)
    const urlParams = new URLSearchParams(window.location.search)
    const extensionMode = urlParams.get('extension') === 'true' || !!window.opener
    setIsExtensionMode(extensionMode)

    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // If extension mode, redirect to extension success page
        if (extensionMode) {
          router.push("/extension/success")
        } else {
          router.push("/prompt")
        }
      }
    }
    
    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateClientSide = () => {
    const { email, password } = formData

    if (!email || !password) {
      return "Please fill in all fields"
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address"
    }

    return null
  }

  // Handle success and error states
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Login successful!")
      // Redirect based on mode
      if (isExtensionMode) {
        router.push("/extension/success")
      } else {
        router.push("/prompt")
      }
    } else if (state?.errors) {
      if (state.errors.email) {
        if (state.errors.email[0].includes("No account found")) {
          toast.error(state.errors.email[0], {
            action: {
              label: "Sign up",
              onClick: () => router.push("/signup"),
            },
          })
        } else {
          toast.error(state.errors.email[0])
        }
      }
      if (state.errors.password) {
        toast.error(state.errors.password[0])
      }
      if (state.errors._form) {
        if (state.errors._form[0].includes("confirmation")) {
          toast.warning(state.errors._form[0])
        } else {
          toast.error(state.errors._form[0])
        }
      }
    }
  }, [state, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Client-side validation
    const validationError = validateClientSide()
    if (validationError) {
      toast.error(validationError)
      return
    }

    const formDataObj = new FormData(e.currentTarget)
    formAction(formDataObj)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/">
              <Image src="/wisp.svg" alt="Wisp logo" width={120} height={120} priority className="object-contain" />
            </Link>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring ${
                    state?.errors?.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  required
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring ${
                    state?.errors?.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm font-medium text-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-medium disabled:opacity-50"
              >
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link 
                  href={isExtensionMode ? "/signup?extension=true" : "/signup"} 
                  className="font-medium text-foreground hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
