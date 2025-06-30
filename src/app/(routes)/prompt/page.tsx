'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useApp } from '@/contexts/appContext'
import PromptCard from '@/components/prompt-card'
import { type PromptData } from '@/lib/models'

export default function Prompt() {
  const { state, actions, search } = useApp()
  const user = state.user
  const [query, setQuery] = useState("");
  const allFilteredPrompts: PromptData[] = search?.searchPrompts(query) || [];
  console.log("All filtered prompts:", allFilteredPrompts);
  
  const handlePromptSelect = (prompt: PromptData) => {
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
    return user?.user_metadata?.username || 
           user?.user_metadata?.full_name || 
           user?.email?.split('@')[0] || 
           'Creator'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--black)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">Please log in</h2>
          <p className="text-[var(--moonlight-silver)]">You need to be logged in to access prompts.</p>
        </div>
      </div>
    )
  }

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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--slate-700)]/10 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[var(--moonlight-silver)]/40" />
                  </div>
                  <h4 className="text-white text-lg font-medium mb-2">No results found</h4>
                  <p className="text-[var(--moonlight-silver)]/60 text-sm mb-4">
                    We couldn&apos;t find any prompts matching &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-2 py-4 text-left">
                  <ul className="grid gap-2">
                    {allFilteredPrompts.map((prompt: PromptData) => (
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