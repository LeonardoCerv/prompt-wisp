'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Sparkles, RefreshCw, Search } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

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
      <div className="flex-shrink-0 p-6 space-y-8 bg-[var(--blackblack)]">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
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
          <div className="max-w-4xl mx-auto relative">
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="relative bg-[var(--obsidian-900)]/80 border border-[var(--slate-700)]/40 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-[var(--wisp-blue)]/50 focus-within:shadow-[var(--wisp-blue)]/10 focus-within:shadow-2xl">
                  <div className="flex items-start gap-4 p-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--wisp-blue)]/20 to-[var(--ethereal-teal)]/20 flex items-center justify-center mt-1">
                      <Search size={20} className="text-[var(--wisp-blue)]" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Ask me anything about your prompts, collections, or library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {/* Always open */}}
                        className="w-full bg-transparent text-white placeholder-[var(--moonlight-silver)]/60 border-0 outline-none resize-none text-lg font-light leading-relaxed min-h-[60px] max-h-[200px] overflow-y-auto"
                        rows={1}
                        style={{
                          height: 'auto',
                          minHeight: '60px'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                        }}
                      />
                      {searchQuery.trim() && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--slate-700)]/30">
                          <div className="text-[var(--moonlight-silver)]/50 text-sm">
                            {isSearching ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`}
                          </div>
                          <div className="flex items-center gap-2">
                            {isSearching && (
                              <RefreshCw size={16} className="text-[var(--moonlight-silver)] animate-spin" />
                            )}
                            <button
                              onClick={() => searchQuery.trim() && (window.location.href = `/prompt?search=${encodeURIComponent(searchQuery.trim())}`)}
                              className="px-4 py-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                              <Search size={14} />
                              Search All
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results - Always visible with loading states */}
          <div className="max-w-4xl mx-auto mt-6 mb-12">
            <div className="bg-[var(--obsidian-900)]/60 border border-[var(--slate-700)]/30 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
              {searchQuery.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--wisp-blue)]/10 to-[var(--ethereal-teal)]/10 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[var(--wisp-blue)]" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">Start searching your library</h4>
                  <p className="text-[var(--moonlight-silver)]/60 text-sm mb-6 max-w-md mx-auto">
                    Find prompts, collections, and more from your personal library. Try searching for keywords, tags, or topics.
                  </p>
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="p-6 text-center">
                  <div className="text-[var(--moonlight-silver)]/50 text-sm">
                    Type at least 2 characters to search...
                  </div>
                </div>
              ) : isSearching ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--wisp-blue)]/10 to-[var(--ethereal-teal)]/10 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw size={24} className="text-[var(--wisp-blue)] animate-spin" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">Searching...</h4>
                  <p className="text-[var(--moonlight-silver)]/60 text-sm">
                    Looking for "{searchQuery}" in your library
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-[var(--slate-700)]/20">
                  {searchResults.map((result, index) => (
                    <Link
                      key={result.id || index}
                      href={`/prompt/${result.slug || result.id}`}
                      className="block px-6 py-5 hover:bg-[var(--obsidian-800)]/30 transition-colors duration-200 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--wisp-blue)]/20 to-[var(--ethereal-teal)]/20 flex items-center justify-center flex-shrink-0 group-hover:from-[var(--wisp-blue)]/30 group-hover:to-[var(--ethereal-teal)]/30 transition-colors duration-200">
                          <Sparkles size={18} className="text-[var(--wisp-blue)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-lg font-medium mb-2 group-hover:text-[var(--wisp-blue)] transition-colors duration-200">
                            {result.title || 'Untitled Prompt'}
                          </h4>
                          <p className="text-[var(--moonlight-silver)]/70 text-sm leading-relaxed mb-3 line-clamp-3">
                            {result.description || 'No description available'}
                          </p>
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {result.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                <span
                                  key={tagIndex}
                                  className="inline-block px-3 py-1 bg-[var(--slate-700)]/20 text-[var(--moonlight-silver)]/60 text-xs rounded-full border border-[var(--slate-700)]/30"
                                >
                                  {tag}
                                </span>
                              ))}
                              {result.tags.length > 3 && (
                                <span className="text-[var(--moonlight-silver)]/40 text-xs">
                                  +{result.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-[var(--moonlight-silver)]/30 group-hover:text-[var(--wisp-blue)]/50 transition-colors duration-200">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06L10.94 6.22a.75.75 0 0 0 0-1.06L7.28 1.5a.75.75 0 0 0-1.06 1.06L8.94 5.25H2.75a.75.75 0 0 0 0 1.5h6.19L6.22 8.72Z"/>
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--slate-700)]/10 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[var(--moonlight-silver)]/40" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">No results found</h4>
                  <p className="text-[var(--moonlight-silver)]/60 text-sm mb-4">
                    We couldn't find any prompts matching "{searchQuery}"
                  </p>
                  <Link
                    href={`/prompt?search=${encodeURIComponent(searchQuery.trim())}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--wisp-blue)]/10 hover:bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)] rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <Search size={14} />
                    Search all prompts
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Marketplace CTA - Prominent */}
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

        {/* Main Content - Equal Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          {/* Left Column - Recent Activity */}

          {/* Right Column - Quick Actions Grid */}
          <div className="h-full flex flex-col gap-6">
            

          </div>
        </div>
      </div>
    </div>
  )
}
