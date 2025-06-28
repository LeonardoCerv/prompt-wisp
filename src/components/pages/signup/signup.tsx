'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail} from 'lucide-react';
import Image from 'next/image';

import Link from 'next/link';

import { signup } from '../../../app/(routes)/signup/page'

export default function SignupPage() {

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
            <CardTitle className="text-2xl wispy-text-glow">Sign Up</CardTitle>
            <CardDescription className="text-moonlight-silver">
              Enter your username or email and password to access Wisp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-moonlight-silver-bright">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="username or email@example.com"
                    name="email"
                    className="pl-10"
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
                    type='password'
                    placeholder="Enter your password"
                    name="password"
                    className='pl-10'
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                formAction={signup}
                type="submit" 
                className="w-full"
              >
                Sign Up
              </Button>
            </form>

            {/* Log In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-moonlight-silver-dim">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Log In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button 
            variant="ghost"
            className="text-moonlight-silver hover:text-moonlight-silver-bright"
          >
            <Link href="/">
                Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}





