'use client';

import Image from 'next/image'
import Link from 'next/link'
import { HomeIcon, Menu, PlusCircle, LogOut, User2, AppWindow, Contact } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {signout} from './actions'

import { type User } from '@supabase/supabase-js'

export default function Header( { user }: { user: User | null }) {

  return (
    <header className="w-full py-4 px-6 border-b border-moonlight-silver/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/wisplogo.svg"
            alt="Wisp logo"
            width={80}
            height={80}
            priority
            className="object-contain"
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <HomeIcon size={16} />
            <span>Home</span>
          </Link>
          { /* Uncomment if you have a marketplace page}
          <Link href="/marketplace" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <ShoppingBag size={16} />
            <span>Marketplace</span>
          </Link>
          <Link href="#features" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <Layers size={16} />
            <span>Features</span>
          </Link>
          <Link href="#docs" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <BookOpenText size={16} />
            <span>Documentation</span>
          </Link>
        
          */}
          <Link href="/prompt" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <AppWindow size={16} />
            <span>Dashboard</span>
          </Link>
           <Link href="/contact" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <Contact size={16} />
            <span>Contact</span>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
            { user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-moonlight-silver">
                <User2 size={16} />
                <span className="text-sm">
                  {user.user_metadata.full_name || user.email}
                </span>
              </div>
              <Button 
                onClick={signout}
                variant="outline" 
                size="default"
                className="gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="default">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="gap-2 hidden sm:inline-flex" variant="default" size="default">
                  <PlusCircle size={16} />
                  <span>Get Started</span>
                </Button>
              </Link>
              
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}
