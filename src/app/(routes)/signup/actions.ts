"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@lib/utils/supabase/server"
import { SignupFormSchema, type FormState } from "@/lib/validations/auth"

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  
  const supabase = await createClient()

  // Add password confirmation check
  const confirmPassword = formData.get("confirmPassword");
  const passwordInput = formData.get("password");
  if (passwordInput !== confirmPassword) {
    return {
      errors: {
        password: ["Passwords do not match"],
      },
    };
  }

  // Validate and sanitize form fields
  const validatedFields = SignupFormSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, username, password } = validatedFields.data

  try {
    // Check if user already exists using admin API
    try {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()

      if (!listError && users?.users) {
        const emailExists = users.users.some((user) => user.email === email)
        if (emailExists) {
          return {
            errors: {
              email: ["An account with this email already exists. Please try logging in instead."],
            },
          }
        }

        const usernameExists = users.users.some((user) => user.user_metadata?.username === username)
        if (usernameExists) {
          return {
            errors: {
              username: ["This username is already taken. Please choose a different one."],
            },
          }
        }
      }
    } catch {
      // Admin API might not be available, continue with regular signup
      console.log("Admin API not available, proceeding with signup")
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: username,
        },
      },
    })

    if (error) {
      // Handle specific error messages
      if (error.message.includes("User already registered") || error.message.includes("already been registered")) {
        return {
          errors: {
            email: ["An account with this email already exists. Please try logging in instead."],
          },
        }
      } else if (error.message.includes("Password should be at least")) {
        return {
          errors: {
            password: ["Password must be at least 6 characters long"],
          },
        }
      } else if (error.message.includes("Unable to validate email address")) {
        return {
          errors: {
            email: ["Please enter a valid email address"],
          },
        }
      } else if (error.message.includes("Signup is disabled")) {
        return {
          errors: {
            _form: ["Account creation is currently disabled. Please contact support."],
          },
        }
      } else if (error.message.includes("Password is too weak")) {
        return {
          errors: {
            password: ["Password is too weak. Please choose a stronger password."],
          },
        }
      } else {
        return {
          errors: {
            _form: [error.message],
          },
        }
      }
    }

    // Check if user was actually created (not just returned existing user)
    if (data.user && !data.user.email_confirmed_at) {
      // User was created and needs email confirmation
      revalidatePath("/", "layout")
      return {
        success: true,
        message: "Account created successfully! Please check your email to verify your account.",
      }
    } else if (data.user && data.user.email_confirmed_at) {
      // User already exists and is confirmed
      return {
        errors: {
          email: ["An account with this email already exists. Please try logging in instead."],
        },
      }
    }

    // Success case
    revalidatePath("/", "layout")
    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    }
  } catch (error) {
    console.error("Signup error:", error)
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
