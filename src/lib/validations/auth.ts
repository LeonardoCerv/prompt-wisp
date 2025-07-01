import { z } from "zod"

export const SignupFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(254, { message: "Email is too long" })
    .toLowerCase()
    .trim(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be less than 20 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password is too long" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
})

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(254, { message: "Email is too long" })
    .toLowerCase()
    .trim(),
  password: z.string().min(1, { message: "Password is required" }).max(128, { message: "Password is too long" }),
})

export type FormState =
  | {
      errors?: {
        email?: string[]
        username?: string[]
        password?: string[]
        _form?: string[]
      }
      message?: string
      success?: boolean
    }
  | undefined
