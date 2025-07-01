"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@lib/utils/supabase/server"
import { LoginFormSchema, type FormState } from "@/lib/validations/auth"

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  // Validate and sanitize form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Check if user exists
    const { data: { user } } = await supabase.auth.getUser(email);
    const userExists = !!user;

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle specific error messages
      if (error.message.includes("Invalid login credentials")) {
        if (userExists) {
          return {
            errors: {
              password: ["Invalid password. Please check your password and try again."],
            },
          }
        } else {
          return {
            errors: {
              email: ["No account found with this email address. Please sign up first."],
            },
          }
        }
      } else if (error.message.includes("Email not confirmed")) {
        return {
          errors: {
            _form: ["Please check your email and click the confirmation link before logging in."],
          },
        }
      } else if (error.message.includes("Email link is invalid")) {
        return {
          errors: {
            _form: ["Email confirmation link is invalid or expired. Please request a new one."],
          },
        }
      } else if (error.message.includes("Too many requests")) {
        return {
          errors: {
            _form: ["Too many login attempts. Please wait a moment before trying again."],
          },
        }
      } else {
        // Generic error message when we can't determine the specific issue
        return {
          errors: {
            _form: ["Invalid email or password. Please check your credentials and try again."],
          },
        }
      }
    }

    if (data.user) {
      revalidatePath("/", "layout")
      return {
        success: true,
        message: "Login successful! Redirecting...",
      }
    }

    return {
      errors: {
        _form: ["Login failed. Please try again."],
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
    }
  }
}

export async function handleSignInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/prompt")
}
