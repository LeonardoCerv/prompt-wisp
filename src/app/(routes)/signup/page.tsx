'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      return;
    }
    
    if (password !== confirmPassword) {
      return;
    }
    
    try {
      await signup(username.trim(), email.trim(), password);
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Signup failed:', err);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return 'bg-destructive';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4:
      case 5: return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return 'Very weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Strong';
      case 5: return 'Very strong';
      default: return '';
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
            <CardTitle className="text-2xl wispy-text-glow">Create Account</CardTitle>
            <CardDescription className="text-moonlight-silver">
              Sign up to start using Wisp for prompt management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-moonlight-silver-bright">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-moonlight-silver-dim w-4 h-4" />
                </div>
                {username && username.length < 3 && (
                  <p className="text-xs text-destructive">Username must be at least 3 characters long</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-moonlight-silver-bright">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Create a password"
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength(password))}`}
                          style={{ width: `${(passwordStrength(password) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-moonlight-silver-dim min-w-fit">
                        {getStrengthText(passwordStrength(password))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-moonlight-silver-bright">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-moonlight-silver-dim w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-moonlight-silver-dim hover:text-moonlight-silver"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-2">
                    {password === confirmPassword ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className={`text-xs ${password === confirmPassword ? 'text-green-500' : 'text-destructive'}`}>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-xs text-moonlight-silver-dim mb-2">Password requirements:</p>
                <ul className="text-xs text-moonlight-silver-dim space-y-1">
                  <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-500' : ''}`}>
                    {password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-current" />
                    Recommended: mix of uppercase, lowercase, numbers, and symbols
                  </li>
                </ul>
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
                disabled={
                  isLoading || 
                  !username.trim() || 
                  !email.trim() || 
                  !password.trim() || 
                  !confirmPassword.trim() ||
                  password !== confirmPassword ||
                  username.length < 3 ||
                  password.length < 8
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-moonlight-silver-dim">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in
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
