"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup } from "./actions"
import { useState } from "react"
import { useActionState } from "react"
import { toast } from "sonner"

import Link from "next/link"
import Image from "next/image"

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, undefined)
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
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
    const { email, username, password, confirmPassword } = formData

    if (!email || !username || !password || !confirmPassword) {
      return "Please fill in all fields"
    }

    if (password !== confirmPassword) {
      return "Passwords do not match"
    }

    return null
  }

  // Handle success and error states
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Account created successfully!")
      // Redirect to check-email page
      router.push("/check-email")
    } else if (state?.errors) {
      if (state.errors.email) {
        if (state.errors.email[0].includes("already exists")) {
          toast.error(state.errors.email[0], {
            action: {
              label: "Log in",
              onClick: () => router.push(isExtensionMode ? "/login?extension=true" : "/login"),
            },
          })
        } else {
          toast.error(state.errors.email[0])
        }
      }
      if (state.errors.username) {
        toast.error(state.errors.username[0])
      }
      if (state.errors.password) {
        toast.error(state.errors.password[0])
      }
      if (state.errors._form) {
        if (state.errors._form[0].includes("disabled")) {
          toast.warning(state.errors._form[0])
        } else {
          toast.error(state.errors._form[0])
        }
      }
    }
  }, [state, router, isExtensionMode])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Client-side validation
    const validationError = validateClientSide()
    if (validationError) {
      e.preventDefault()
      toast.error(validationError)
      return
    }

    // Let the form action handle the submission
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
              <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
              <p className="text-muted-foreground text-sm">Enter your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} action={formAction} className="space-y-4">
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

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  className={`h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring ${
                    state?.errors?.username ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {state?.errors?.username && <p className="text-sm text-red-500">{state.errors.username[0]}</p>}
                <p className="text-xs text-muted-foreground">3-20 characters, letters, numbers, and underscores only</p>
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
                  placeholder="Create a password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={8}
                  className={`h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring ${
                    state?.errors?.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  required
                  type="password"
                  placeholder="Confirm your password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  minLength={8}
                  className={`h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring ${
                    formData.password && formData.password !== formData.confirmPassword 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                      : ""
                  }`}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 bg-foreground text-background hover:bg-foreground/90 font-medium disabled:opacity-50"
              >
                {isPending ? "Creating account..." : "Create account"}
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

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href={isExtensionMode ? "/login?extension=true" : "/login"} 
                  className="font-medium text-foreground hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
            {/* Terms & Privacy Notice */}
            <div className="text-center mt-16">
              <span className="text-xs text-muted-foreground">
                By continuing, you acknowledge that you understand and agree to the{" "}
                <Link href="/terms-of-service" className="underline hover:text-foreground transition-colors">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
