'use client';

import { useAuth } from '@/context/AuthContext';
import Image from "next/image";
import Link from "next/link";
import { Palette, Sparkles, Moon, Layers, User, Mail, BookOpen, Settings, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

// Dashboard Component for authenticated users
function Home({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light text-moonlight-silver-bright wispy-text-glow">
            Welcome back, {user.username}!
          </h1>
          <p className="text-moonlight-silver">
            Wisp Dashboard - Your AI prompt management tool
          </p>
        </div>

        {/* User Info Card */}
        <Card className="wispy-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-moonlight-silver-dim text-sm">Username:</span>
                  <span className="text-moonlight-silver-bright">
                    {user.username}
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
  );
}

// Landing Page Component for non-authenticated users
function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="px-6 py-12 text-center bg-gradient-to-br from-background via-background to-dusky-purple/5">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center mb-8">
            <Image 
              src="/wisplogo.svg"
              alt="Wisp logo"
              width={200}
              height={200}
              priority
              className="object-contain"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light text-moonlight-silver-bright wispy-text-glow">
            Prompt Wisp
          </h1>
          
          <p className="text-xl md:text-2xl text-moonlight-silver max-w-2xl mx-auto">
            Your ethereal companion for managing AI prompts with elegance and precision
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8 py-3 text-lg">
                <UserPlus className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="gap-2 px-8 py-3 text-lg">
                <LogIn className="w-5 h-5" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-moonlight-silver-bright mb-4">
              Ethereal Features
            </h2>
            <p className="text-moonlight-silver text-lg max-w-2xl mx-auto">
              Discover the wispy magic that makes prompt management effortless
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="wispy-border surface-transition surface-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Smart Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-moonlight-silver">
                  Organize your prompts with intelligent categorization and tagging
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="wispy-border surface-transition surface-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-ethereal-teal" />
                  Version Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-moonlight-silver">
                  Track changes and maintain versions of your prompts effortlessly
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="wispy-border surface-transition surface-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-soft-lavender" />
                  Dark Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-moonlight-silver">
                  Beautiful dark interface designed for extended use
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Color Palette Showcase */}
      <div className="px-6 py-16 bg-dusky-purple/5">
        <div className="max-w-4xl mx-auto">
          <WispColorPalette />
        </div>
      </div>

      {/* UI Examples */}
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <WispUIExamples />
        </div>
      </div>

      {/* Border Effects */}
      <div className="px-6 py-16 bg-dusky-purple/5">
        <div className="max-w-4xl mx-auto">
          <WispBorderExample />
        </div>
      </div>
    </div>
  );
}

// Component functions
function WispColorPalette() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 justify-center">
        <Palette size={18} className="text-pale-cyan" />
        <h2 className="text-xl font-medium">Wisp Color Palette</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ColorSwatch name="Pale Cyan" variable="--pale-cyan" />
        <ColorSwatch name="Soft Lavender" variable="--soft-lavender" />
        <ColorSwatch name="Ghostly White" variable="--ghostly-white" />
        <ColorSwatch name="Moonlight Silver" variable="--moonlight-silver" />
        <ColorSwatch name="Ethereal Teal" variable="--ethereal-teal" />
        <ColorSwatch name="Faint Rose" variable="--faint-rose" />
        <ColorSwatch name="Dusky Purple" variable="--dusky-purple" />
        <ColorSwatch name="Glow Ember" variable="--glow-ember" />
      </div>
    </div>
  );
}

function ColorSwatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-md shadow-sm mb-2"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <span className="text-xs text-center">{name}</span>
    </div>
  );
}

function WispUIExamples() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 justify-center">
        <Sparkles size={18} className="text-ghostly-white" />
        <h2 className="text-xl font-medium">UI Components</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Moonlight Card</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              A wispy card with silver text for better contrast. Hover to see elevation effect.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button variant="default">
            Important Button
          </Button>
          <Button variant="secondary">
            Silver Button
          </Button>
          <Button variant="ghost">
            Ghost Button
          </Button>
        </div>
      </div>
    </div>
  );
}

function WispBorderExample() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 justify-center">
        <Sparkles size={18} className="text-ethereal-teal" />
        <h2 className="text-xl font-medium">Wispy Effects</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="wispy-border">
          <CardHeader>
            <CardTitle className="wispy-text-glow">Silver Glow</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Moonlight Silver creates a subtle glow effect around this component's border.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-muted border-moonlight-silver/50">
          <CardHeader>
            <CardTitle className="wispy-gradient-text">Gradient Effect</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              The wispy gradient creates flowing text effects.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Page Component
export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-moonlight-silver animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && user ? (
        <Home user={user} />
      ) : (
        <LandingPage />
      )}
    </>
  );
}
