"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/utils/supabase/client"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface UserData {
  id: string
  email: string
  user_metadata: Record<string, unknown>
  created_at: string
}

export default function ExtensionSuccessPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          setError("Not authenticated")
          setLoading(false)
          return
        }

        setUserData({
          id: user.id,
          email: user.email || "",
          user_metadata: user.user_metadata,
          created_at: user.created_at || "",
        })
        setLoading(false)

        // Notify web extension that authentication is complete
        // The extension should be listening for this event
        window.postMessage({
          type: 'PROMPT_WISP_AUTH_SUCCESS',
          userData: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            created_at: user.created_at,
          }
        }, '*')

        // Also store in sessionStorage for extension to read
        sessionStorage.setItem('prompt_wisp_user_data', JSON.stringify({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            created_at: user.created_at,
          }
        }))

      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to fetch user data")
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleCloseWindow = () => {
    // For popup windows opened by extensions
    if (window.opener) {
      window.close()
    } else {
      // Redirect to main app
      window.location.href = "/prompt"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">Authentication Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = "/login"} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image 
            src="/wisplogo.svg" 
            alt="Prompt Wisp" 
            width={64} 
            height={64}
            className="rounded-lg"
          />
        </div>
        
        <div className="text-green-600 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-800 mb-4">Authentication Successful!</h1>
        <p className="text-green-600 mb-6">
          Your web extension has been successfully connected to Prompt Wisp.
        </p>
        
        {userData && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-2">Connected Account:</h3>
            <p className="text-sm text-green-700">
              <strong>Email:</strong> {userData.email}
            </p>
            <p className="text-sm text-green-700">
              <strong>User ID:</strong> {userData.id}
            </p>
          </div>
        )}

        {/* Hidden data for extension to read */}
        <div 
          id="extension-user-data" 
          data-user-data={JSON.stringify({
            authenticated: true,
            user: userData
          })}
          style={{ display: 'none' }}
        />

        <div className="space-y-3">
          <Button 
            onClick={handleCloseWindow}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {window.opener ? 'Close Window' : 'Continue to App'}
          </Button>
          
          <p className="text-xs text-gray-500">
            You can now close this window and use the extension.
          </p>
        </div>
      </div>
    </div>
  )
}
