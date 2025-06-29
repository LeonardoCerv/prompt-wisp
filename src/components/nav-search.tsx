import React, { useState } from 'react';
import { useApp } from '@/contexts/appContext';
import type { PromptData } from '@/lib/models';
import PromptCard from './prompt-card';
import { useRouter } from 'next/navigation';
import Dialog from './ui/dialog';
import { Search } from "lucide-react";

interface NavSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const NavSearchModal: React.FC<NavSearchModalProps> = ({ open, onClose }) => {
  const { actions, search } = useApp()
  const [query, setQuery] = useState("");
  const router = useRouter();

  const allFilteredPrompts = search?.searchPrompts(query) || [];

  const handlePromptSelect = (prompt: PromptData) => {
    onClose();
    actions.setSelectedPrompt(prompt);
    router.push(`/prompt/${prompt.id}`);
  };

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title=""
      maxWidth="max-w-2xl"
      variant="transparent"
    >
      <div className="w-full min-h-[500px] max-h-[80vh] flex flex-col items-center p-0">
        {/* Search Field - LLM Chat Style */}
        <div className="w-full max-w-2xl mx-auto relative z-10">
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
                    style={{ height: "auto", minHeight: "60px" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = Math.min(target.scrollHeight, 200) + "px";
                    }}
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Area - Always visible, scrollable if overflow */}
        <div className="w-full max-w-2xl flex-1 mt-6 mb-6 flex flex-col">
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
                  We couldn&apos;t find any prompts matching &quot;{query}&quot;
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-2 py-4">
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
    </Dialog>
  );
};

export default NavSearchModal;
