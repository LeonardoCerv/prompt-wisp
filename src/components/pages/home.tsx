'use client';

import { User2, Mail, Sparkles, BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { type User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function HomePage( { user }: { user: User}) {
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="wispy-border surface-transition surface-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-accent" />
                Create Prompt
              </CardTitle>
              <CardDescription>
                Create and manage your AI prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                New Prompt
              </Button>
            </CardContent>
          </Card>

          <Card className="wispy-border surface-transition surface-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-ethereal-teal" />
                Library
              </CardTitle>
              <CardDescription>
                Explore your prompt collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                View Library
              </Button>
            </CardContent>
          </Card>

          <Card className="wispy-border surface-transition surface-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-moonlight-silver" />
                Settings
              </CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="wispy-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions in Wisp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-moonlight-silver-dim mx-auto mb-4" />
              <p className="text-moonlight-silver-dim">
                No recent activity. Start by creating your first prompt!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    )}