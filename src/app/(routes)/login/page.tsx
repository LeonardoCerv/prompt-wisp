'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!identifier.trim()) {
      toast.error('Please enter your username or email');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    
    try {
      await login(identifier.trim(), password);
      toast.success('Welcome back! Redirecting to dashboard...');
    } catch (err) {
      // Error is handled by the AuthContext, but we can show additional toast
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Image 
              src="/wisplogo.svg"
              alt="Wisp logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </Link>
        </div>

        <Card className="wispy-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl wispy-text-glow">Sign In</CardTitle>
            <CardDescription className="text-moonlight-silver">
              Enter your username or email and password to access Wisp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username/Email Field */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-moonlight-silver-bright">
                  Username or Email
                </Label>
                <div className="relative">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="username or email@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-moonlight-silver-dim w-4 h-4" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-moonlight-silver-bright">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-moonlight-silver-dim w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-moonlight-silver-dim hover:text-moonlight-silver"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !identifier.trim() || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-moonlight-silver-dim">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="text-moonlight-silver hover:text-moonlight-silver-bright"
          >
            ← Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
