'use client';

import { User2, Mail, Sparkles, BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../..//ui/card';

export default function UserPage( { user }: { user: User}) {
    return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light text-moonlight-silver-bright wispy-text-glow">
            Welcome back, {user.email}!
          </h1>
          <p className="text-moonlight-silver">
            Wisp Dashboard - Your AI prompt management tool
          </p>
        </div>

        {/* User Info Card */}
        <Card className="wispy-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-primary" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-moonlight-silver-dim text-sm">Username:</span>
                  <span className="text-moonlight-silver-bright">
                    {user.user_metadata.username || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-moonlight-silver-dim" />
                  <span className="text-moonlight-silver">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-moonlight-silver-dim text-sm">User ID:</span>
                  <span className="text-moonlight-silver">{user.id}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    )}