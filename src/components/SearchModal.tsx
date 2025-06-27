import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/appContext';
import type { PromptData, CollectionData } from '@/lib/models';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const { state, utils } = useApp();
  const [query, setQuery] = useState('');

  // Gather all relevant items: owned/bought prompts, owned/bought collections
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

  // Collections: owned or bought (not deleted)
  const collections = useMemo(() =>
    state.collections.filter(
      (c) =>
        (!c.deleted &&
          (c.user_id === userId || (c.prompts || []).some(pid => boughtPromptIds.includes(pid))))
    ),
    [state.collections, userId, boughtPromptIds]
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

  // Recently deleted collections: owned or bought
  const deletedCollections = useMemo(() =>
    state.collections.filter(
      (c) =>
        c.deleted &&
        (c.user_id === userId || (c.prompts || []).some(pid => boughtPromptIds.includes(pid)))
    ),
    [state.collections, userId, boughtPromptIds]
  );

  // Filtered results
  const filteredPrompts = useMemo(() =>
    prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
    ),
    [prompts, query]
  );

  const filteredCollections = useMemo(() =>
    collections.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
    ),
    [collections, query]
  );

  // Filtered deleted results
  const filteredDeletedPrompts = useMemo(() =>
    deletedPrompts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
    ),
    [deletedPrompts, query]
  );

  const filteredDeletedCollections = useMemo(() =>
    deletedCollections.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
    ),
    [deletedCollections, query]
  );

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
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring"
          placeholder="Search collections, prompts, ..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {query && (
            <>
              <div>
                <h3 className="font-semibold text-sm mb-1">Prompts</h3>
                {filteredPrompts.length > 0 ? (
                  <ul>
                    {filteredPrompts.map((prompt) => (
                      <li key={prompt.id} className="py-1 border-b last:border-b-0">
                        <span className="font-medium">{prompt.title}</span>
                        <span className="ml-2 text-xs text-zinc-500">{utils.truncateText(prompt.description || '', 40)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-zinc-400">No prompts found.</div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Collections</h3>
                {filteredCollections.length > 0 ? (
                  <ul>
                    {filteredCollections.map((col) => (
                      <li key={col.id} className="py-1 border-b last:border-b-0">
                        <span className="font-medium">{col.title}</span>
                        <span className="ml-2 text-xs text-zinc-500">{utils.truncateText(col.description || '', 40)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-zinc-400">No collections found.</div>
                )}
              </div>
              {/* Recently Deleted Section */}
              {(filteredDeletedPrompts.length > 0 || filteredDeletedCollections.length > 0) && (
                <div>
                  <h3 className="font-semibold text-sm mb-1 mt-4">Recently Deleted</h3>
                  {filteredDeletedPrompts.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-zinc-500 mb-1">Prompts</div>
                      <ul>
                        {filteredDeletedPrompts.map((prompt) => (
                          <li key={prompt.id} className="py-1 border-b last:border-b-0 opacity-60">
                            <span className="font-medium line-through">{prompt.title}</span>
                            <span className="ml-2 text-xs text-zinc-500">{utils.truncateText(prompt.description || '', 40)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {filteredDeletedCollections.length > 0 && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Collections</div>
                      <ul>
                        {filteredDeletedCollections.map((col) => (
                          <li key={col.id} className="py-1 border-b last:border-b-0 opacity-60">
                            <span className="font-medium line-through">{col.title}</span>
                            <span className="ml-2 text-xs text-zinc-500">{utils.truncateText(col.description || '', 40)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {!query && <div className="text-xs text-zinc-400">Type to search your prompts and collections.</div>}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
