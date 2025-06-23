'use client'

import { useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { usePrompts } from '@/components/use-prompts'
import { PromptProvider } from '@/components/promptContext'
import PromptSidebar from '@/components/promptSidebar'
import PromptMidbar from '@/components/promptMidbar'

interface NavbarProps {
  user: User
  children?: React.ReactNode
}

export default function Navbar({ user, children }: NavbarProps) {
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
    updatePrompt,
    isOwner,
    getFilterCount
  } = usePrompts()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)

  return (
    <PromptProvider
      value={{
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
        updatePrompt,
        isOwner,
        getFilterCount,
        user
      }}
    >
      <div className="min-h-screen bg-[var(--black)] w-full">
        <div className="h-screen">
          {/* Three Column Layout */}
          <div className="flex gap-0 h-full">

            {/* Left Column - Filters */}
            <div className="w-[240px] flex-shrink-0 h-full">
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
                onHomeClick={() => setActiveFilter('all')}
              />
            </div>

            {/* Center Column - Prompt List */}
            <div className={`h-full flex flex-col ${activeFilter === 'all' ? 'hidden' : 'w-[300px]'}`}>
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


            <div className="flex-1 h-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </PromptProvider>
  )
}
