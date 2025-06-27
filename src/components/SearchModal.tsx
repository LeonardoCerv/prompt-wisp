import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/appContext';
import type { PromptData } from '@/lib/models';
import PromptCard from './promptCard';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const { state, utils, actions } = useApp();
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Gather all relevant items: owned/bought prompts
  const userId = state.user?.id;
  const boughtPromptIds = state.user?.bought || [];
  const favoritePromptIds = state.user?.favorites || [];

  // Prompts: owned or bought (not deleted)
  const prompts = useMemo(() =>
    state.prompts.filter(
      (p) =>
        (!p.deleted &&
          (p.user_id === userId || boughtPromptIds.includes(p.id)))
    ),
    [state.prompts, userId, boughtPromptIds]
  );

  // Recently deleted prompts: owned or bought
  const deletedPrompts = useMemo(() =>
    state.prompts.filter(
      (p) =>
        p.deleted &&
        (p.user_id === userId || boughtPromptIds.includes(p.id))
    ),
    [state.prompts, userId, boughtPromptIds]
  );

  // Combined filtered prompts (active and deleted, keep deleted style)
  const allFilteredPrompts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let active = [];
    let deleted = [];
    if (q.startsWith('#')) {
      const tagQuery = q.slice(1);
      active = prompts.filter(
        (p) => p.tags && p.tags.some(tag => tag.toLowerCase().includes(tagQuery))
      );
      deleted = deletedPrompts.filter(
        (p) => p.tags && p.tags.some(tag => tag.toLowerCase().includes(tagQuery))
      );
    } else {
      active = prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
      );
      deleted = deletedPrompts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    return [...active, ...deleted];
  }, [prompts, deletedPrompts, query]);

  const handlePromptSelect = (prompt: PromptData) => {
    onClose();
    actions.setSelectedPrompt(prompt)
    router.push(`/prompt/${prompt.id}`)
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          onClick={onClose}
          aria-label="Close search"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">Search</h2>
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring pr-10"
            placeholder="Search prompts or #tag ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{ position: 'relative', background: 'transparent' }}
          />
          {query.trim().startsWith('#') && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none text-blue-600 font-semibold">
              {query.split(' ')[0]}
            </span>
          )}
        </div>
        <div className="space-y-6 max-h-80 overflow-y-auto">
          {query && (
            <>
              <div>
                <h3 className="font-semibold text-sm mb-2 text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                  <span>Best matches</span>
                </h3>
                {allFilteredPrompts.length > 0 ? (
                  <ul className="grid gap-2">
                    {allFilteredPrompts.map((prompt) => (
                      <li key={prompt.id}>
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
                ) : (
                  <div className="text-xs text-zinc-400">No prompts found.</div>
                )}
              </div>
            </>
          )}
          {!query && <div className="text-xs text-zinc-400">Type to search your prompts or #tag.</div>}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
