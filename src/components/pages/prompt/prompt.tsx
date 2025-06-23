'use client'

import { useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { usePrompts } from '@/components/use-prompts'
import PromptSidebar from '@/components/promptSidebar'
import PromptPreview from '@/components/promptPreview'
import PromptMidbar from '@/components/promptMidbar'

interface PromptPageProps {
  user: User
}

export default function PromptPage({ user }: PromptPageProps) {
  const {
    prompts,
    filteredPrompts,
    searchTerm,
    activeFilter,
    selectedTags,
    selectedPrompt,
    allTags,
    setSearchTerm,
    setActiveFilter,
    toggleTag,
    selectPrompt,
    toggleFavorite,
    copyToClipboard,
    deletePrompt,
    restorePrompt,
    savePrompt,
    createNewPrompt,
    isOwner,
    getFilterCount
  } = usePrompts()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)

  const handleCreatePrompt = (newPrompt: {
    title: string
    description: string
    category: string
    tags: string
    content: string
  }) => {
    createNewPrompt(newPrompt)
    setShowCreateForm(false)
  }

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-full">
        {/* Three Column Layout */}
        <div className="grid grid-cols-5 gap-0">

          {/* Left Column - Filters */}
          <div className="col-span-5 lg:col-span-1">
            <PromptSidebar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              allTags={allTags}
              getFilterCount={getFilterCount}
              onSearchFocus={() => searchInputRef?.focus()}
              collectionsExpanded={collectionsExpanded}
              setCollectionsExpanded={setCollectionsExpanded}
              tagsExpanded={tagsExpanded}
              setTagsExpanded={setTagsExpanded}
              libraryExpanded={libraryExpanded}
              setLibraryExpanded={setLibraryExpanded}
            />
          </div>

          {/* Center Column - Prompt List */}
          <div className={`col-span-5 ${activeFilter === 'all' ? 'lg:col-span-1' : 'lg:col-span-1'} pl-6`}>
            <PromptMidbar
              user={user}
              prompts={prompts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onPromptSelect={selectPrompt}
              onCreatePrompt={() => setShowCreateForm(true)}
              searchInputRef={searchInputRef}
              setSearchInputRef={setSearchInputRef}
              activeFilter={activeFilter}
              filteredPrompts={filteredPrompts}
              selectedTags={selectedTags}
              selectedPrompt={selectedPrompt}
              onToggleFavorite={toggleFavorite}
              onCopy={copyToClipboard}
              onDelete={deletePrompt}
              onRestore={restorePrompt}
              onSave={savePrompt}
              isOwner={isOwner}
            />
          </div>

          {/* Right Column - Prompt Preview */}
          {activeFilter !== 'all' && (
            <div className="col-span-5 lg:col-span-3 pl-6">
              <PromptPreview
                selectedPrompt={selectedPrompt}
                onToggleFavorite={toggleFavorite}
                onCopy={copyToClipboard}
                onSave={savePrompt}
                onDelete={deletePrompt}
                onRestore={restorePrompt}
                isOwner={isOwner}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
