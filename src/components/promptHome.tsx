'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Sparkles } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import Link from 'next/link'

interface PromptHomeProps {
  user: User
}

export default function PromptHome({
  user,
}: PromptHomeProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header Section with Search */}
      <div className="flex-shrink-0 p-6 bg-[var(--blackblack)]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user.user_metadata?.username || user.email?.split('@')[0] || 'Leo'}!
          </h2>
          <p className="text-[var(--moonlight-silver)] text-base">
            Manage and organize your AI prompts
          </p>
        </div>

        {/* Marketplace Call to Action */}
        <Card className="bg-gradient-to-r from-[var(--deep-charcoal)] to-[var(--slate-grey)] border-[var(--glow-ember)]/30 hover:shadow-xl hover:border-[var(--glow-ember)]/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-[var(--glow-ember)]" />
                  Discover Premium Prompts
                </h3>
                <p className="text-[var(--moonlight-silver)] mb-4">
                  Explore our marketplace for specialized, professional-grade prompts crafted by experts
                </p>
                <div className="flex items-center gap-4 text-sm text-[var(--moonlight-silver-dim)]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--glow-ember)]" />
                    <span>New prompts added weekly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--glow-ember)] font-semibold">1,200+</span>
                    <span>premium prompts</span>
                  </div>
                </div>
              </div>
              <div className="ml-6">
                <Link href="/marketplace">
                  <Button 
                    size="lg"
                    className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90 text-[var(--black)] font-semibold h-12 px-6 hover:scale-105 transition-transform duration-200"
                  >
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
