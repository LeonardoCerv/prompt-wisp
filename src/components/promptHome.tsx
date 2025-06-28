'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Sparkles, RefreshCw, Search } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/contexts/appContext'
import PromptCard from './promptCard'

interface PromptHomeProps {
  user: User
}

export default function PromptHome({
  user,
}: PromptHomeProps) {
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults] = useState(true) // Always true now
  const { state, actions, search } = useApp() as any;
  const [query, setQuery] = useState("");
  const allFilteredPrompts = search?.searchPrompts(query) || [];
  const handlePromptSelect = (prompt: any) => {
    actions.setSelectedPrompt?.(prompt);
    window.location.href = `/prompt/${prompt.id}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getUserName = () => {
    return user.user_metadata?.username || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'Creator'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to prompt page with search query
      window.location.href = `/prompt?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  // Real-time search functionality
  useEffect(() => {
    const searchPrompts = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      if (searchQuery.trim().length < 2) {
        return
      }

      setIsSearching(true)

      try {
        // Simulate API call - replace with actual search endpoint
        const response = await fetch(`/api/prompts?search=${encodeURIComponent(searchQuery.trim())}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.prompts || [])
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchPrompts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Keep results dialog always open when component is focused
  // (No longer needed since showSearchResults is always true)

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <div className="flex-shrink-0 p-6 pt-16 space-y-8 bg-[var(--blackblack)]">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mt-4 mb-16">
            <Image 
              src="/wisp.svg" 
              alt="Wisp Mascot" 
              width={48} 
              height={48} 
              className="animate-pulse"
            />
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, {getUserName()}! 
            </h1>
          </div>
          {/* Search Field - LLM Chat Style */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="relative bg-[var(--obsidian-900)]/80 border border-[var(--slate-700)]/40 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-[var(--wisp-blue)]/50 focus-within:shadow-[var(--wisp-blue)]/10 focus-within:shadow-2xl">
                <div className="flex items-start gap-4 p-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--wisp-blue)]/20 to-[var(--ethereal-teal)]/20 flex items-center justify-center mt-1">
                    <Search size={20} className="text-[var(--wisp-blue)]" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Ask me anything about your prompts, collections, or library..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-[var(--moonlight-silver)]/60 border-0 outline-none resize-none text-lg font-light leading-relaxed min-h-[60px] max-h-[200px] overflow-y-auto"
                      rows={1}
                      style={{ height: 'auto', minHeight: '60px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results - Always visible, scrollable if overflow */}
          <div className="max-w-2xl mx-auto mt-6 mb-12">
            <div className="bg-[var(--obsidian-900)]/60 border border-[var(--slate-700)]/30 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col min-h-[260px] h-[320px] max-h-[400px]">
              {query.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--wisp-blue)]/10 to-[var(--ethereal-teal)]/10 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[var(--wisp-blue)]" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">Start searching your library</h4>
                  <p className="text-[var(--moonlight-silver)]/60 text-sm mb-2 max-w-md mx-auto">
                    Find prompts, collections, and more from your personal library. Try searching for keywords, tags, or topics. Use <span className="font-semibold text-[var(--wisp-blue)]">#tag</span> to search by hashtag.
                  </p>
                </div>
              ) : allFilteredPrompts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--slate-700)]/10 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[var(--moonlight-silver)]/40" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">No results found</h4>
                  <p className="text-[var(--moonlight-silver)]/60 text-sm mb-4">
                    We couldn't find any prompts matching "{query}"
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-2 py-4 text-left">
                  <ul className="grid gap-2">
                    {allFilteredPrompts.map((prompt: any) => (
                      <li key={prompt.id} className="min-h-[60px] max-h-[120px] overflow-hidden">
                        {prompt.deleted ? (
                          <div className="relative cursor-pointer opacity-60 group" onClick={() => handlePromptSelect(prompt)}>
                            <div className="absolute inset-0 pointer-events-none rounded border border-dashed border-red-600 transition-all mx-3"></div>
                            <PromptCard
                              prompt={prompt}
                              isSelected={false}
                              isLast={true}
                              isBeforeSelected={false}
                              onSelect={() => handlePromptSelect(prompt)}
                            />
                          </div>
                        ) : (
                          <PromptCard
                            prompt={prompt}
                            isSelected={false}
                            isLast={false}
                            isBeforeSelected={false}
                            onSelect={() => handlePromptSelect(prompt)}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Marketplace CTA - Prominent 
        <Card className="bg-gradient-to-r from-[var(--wisp-blue)] to-[var(--wisp-blue)]/80 border-[var(--wisp-blue)] shadow-2xl mb-8 transform hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-white text-2xl font-bold flex items-center gap-3 mb-3">
                  <ShoppingBag size={28} className="text-white" />
                  Discover Premium Prompts
                </h2>
                <p className="text-white/90 text-lg mb-4">
                  Explore our marketplace for specialized, professional-grade prompts crafted by experts
                </p>
                <div className="flex items-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-white" />
                    <span>New prompts weekly</span>
                  </div>
                </div>
              </div>
              <div className="ml-8">
                <Link href="/marketplace">
                  <Button 
                    size="lg"
                    className="bg-white text-[var(--wisp-blue)] font-bold h-14 px-8 hover:bg-white/90 hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <ShoppingBag size={20} className="mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        */}
        {/* Main Content - Equal Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px] max-w-5xl mx-auto">
          {/* Left Column - Recent Activity */}

          {/* Right Column - Quick Actions Grid */}
          <div className="h-full flex flex-col gap-6">
            

          </div>
        </div>
      </div>
    </div>
  )
}
