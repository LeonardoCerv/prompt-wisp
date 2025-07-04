"use client"

import { useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const loadUser = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error loading user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    loadUser,
    setUser
  }
}
