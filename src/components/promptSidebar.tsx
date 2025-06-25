'use client'

import { Button } from '@/components/ui/button'
import { 
  Search,  
  Home,
  ChevronDown,
  ChevronRight,
  Edit,
  Archive,
  Trash2,
  BookOpen,
  Plus
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CollectionData, PromptData, UserData } from '@/lib/models'
import { useNavbar } from '../context/navbarContext'
import NewCollection from './newCollection'
import { useState } from 'react'

interface PromptSidebarProps {
  prompts: PromptData[]
  user: UserData
  activeFilter: string
  onFilterChange: (filter: string) => void
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  allTags: string[]
  getFilterCount: (filter: string) => number
}

export default function PromptSidebar({
  prompts, user,
  activeFilter, onFilterChange,
  selectedTags, onTagToggle, allTags, getFilterCount
}: PromptSidebarProps) {
  // Use navbar context for sidebar state
  const {
    collectionsExpanded, setCollectionsExpanded,
    tagsExpanded, setTagsExpanded,
    libraryExpanded, setLibraryExpanded,
    collections, selectedCollection, setSelectedCollection
  } = useNavbar()

  // Local state for NewCollection dialog
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)

  // Prevent opening the create collection dialog if user is not loaded
  const handleCreateCollectionClick = (e?: React.MouseEvent) => {
    setIsNewCollectionOpen(true)
    if (e) e.stopPropagation();
    if (!user || !user.id) {
      // Optionally show a toast or alert here
      console.log('User not loaded or not authenticated')
      return
    }
    setIsNewCollectionOpen(true)
  }

  // Handle NewCollection submit
  const handleCreateCollection = async (data: any) => {
    if (!user || !user.id) return
    try {
      const requestBody = {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        tags: data.tags,
        visibility: data.visibility || 'private',
        images: data.images || [],
        collaborators: data.collaborators?.map((c: any) => c.id) || [],
        prompts: data.prompts?.map((p: any) => p.id) || [],
        user_id: user.id
      }
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      if (response.ok) {
        // Optionally show a toast here
        // Refresh collections
        if (typeof window !== 'undefined') {
          // Re-fetch collections via context
          window.location.reload()
        }
      }
    } catch (e) {
      // Optionally show a toast here
    }
    setIsNewCollectionOpen(false)
  }

  return (
    <div className="bg-[var(--black)] h-screen w-[240px] max-w-[240px] pl-6 pr-4 py-6 border-r border-[var(--moonlight-silver-dim)]/30 flex flex-col fixed top-0 left-0 z-50">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 justify-center p-2 mb-6">
          <Image 
            src="/wisplogo.svg"
            alt="Wisp logo"
            width={100}
            height={100}
            priority
            className="object-contain"
          />
        </Link>

        {/* Search */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-[var(--moonlight-silver-bright)] rounded-lg py-2 px-3 mb-4"
          onClick={() => { /* Optionally use context for search focus */ }}
          title="Search"
        >
          <Search size={16} className="flex-shrink-0" />
          <span className="truncate">Search</span>
        </Button>

        {/* Home */}
        <Link href="/prompt/">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 rounded-lg py-2 px-3 mb-6 ${
              activeFilter === 'all' 
                ? 'bg-[var(--wisp-blue)] text-white shadow-sm' 
                : 'text-[var(--moonlight-silver-bright)]'
            }`}
            title="Home"
            onClick={() => {
              onFilterChange('all')
              // Optionally use context for home click
            }}
          >
            <Home size={16} className="flex-shrink-0" />
            <span className="truncate">Home</span>
            <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded flex-shrink-0">
              {getFilterCount('all')}
            </span>
          </Button>
        </Link>
      </div>

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Library Section */}
        <div className="space-y-2">
          <h3 
            className="text-[10px] font-medium text-[var(--flare-cyan)] uppercase tracking-wider mb-3 cursor-pointer hover:text-[var(--flare-cyan)]/70 transition-colors flex items-center justify-between"
            onClick={() => setLibraryExpanded(!libraryExpanded)}
          >
            Library
            {libraryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </h3>
          
          {libraryExpanded && (
            <div className="space-y-1">
              <Button
                variant={activeFilter === 'all-prompts' ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                  activeFilter === 'all-prompts' 
                    ? 'bg-[var(--wisp-blue)] text-white shadow-sm' 
                    : 'text-[var(--moonlight-silver-bright)]'
                }`}
                onClick={() => onFilterChange('all-prompts')}
                title="All Prompts"
              >
                <BookOpen size={16} className="flex-shrink-0" />
                <span className="truncate">All Prompts</span>
                <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded flex-shrink-0">
                  {getFilterCount('all-prompts')}
                </span>
              </Button>

              <Button
                variant={activeFilter === 'your-prompts' ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                  activeFilter === 'your-prompts' 
                    ? 'bg-[var(--wisp-blue)] text-white shadow-sm' 
                    : 'text-[var(--moonlight-silver-bright)]'
                }`}
                onClick={() => onFilterChange('your-prompts')}
                title="Your Prompts"
              >
                <Edit size={16} className="flex-shrink-0" />
                <span className="truncate">Your Prompts</span>
                <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded flex-shrink-0">
                  {getFilterCount('your-prompts')}
                </span>
              </Button>
              
              <Button
                variant={activeFilter === 'saved' ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                  activeFilter === 'saved' 
                    ? 'bg-[var(--flare-cyan)] text-white shadow-sm' 
                    : 'text-[var(--moonlight-silver-bright)]'
                }`}
                onClick={() => onFilterChange('saved')}
                title="Saved"
              >
                <Archive size={16} className="flex-shrink-0" />
                <span className="truncate">Saved</span>
                <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded flex-shrink-0">
                  {getFilterCount('saved')}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Collections Section */}
        <div className="space-y-2">
            <h3 
              className="text-[10px] font-medium text-[var(--wisp-blue)] uppercase tracking-wider cursor-pointer transition-colors flex justify-between gap-2"
              onClick={() => setCollectionsExpanded(!collectionsExpanded)}
            >
              Collections
              {collectionsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </h3>
                     
          
          {collectionsExpanded && (
            <div className="space-y-1">
               <Button
                variant="ghost"
                onClick={handleCreateCollectionClick}
                className="w-full justify-start gap-3 text-sm text-[var(--wisp-blue)] rounded-lg py-2 px-3 hover:bg-[var(--wisp-blue)]/20 hover:text-[var(--wisp-blue)] border border-dashed border-[var(--wisp-blue)]/40"
                title="Create new collection"
              >
                <Plus size={14} className="flex-shrink-0" />
                <span className="truncate">Create Collection</span>
              </Button>
              {collections.length > 0 ? (
                collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="ghost"
                    className={`w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                      selectedCollection === collection.id
                        ? 'bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)]'
                        : 'text-[var(--moonlight-silver)] hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => {
                      setSelectedCollection(collection.id)
                      onFilterChange('') // Clear activeFilter so collection filter takes precedence
                    }}
                    title={collection.title}
                  >
                    <span className="truncate">{collection.title}</span>
                  </Button>
                ))
              ) : (
                <div className="text-xs text-[var(--moonlight-silver)]/60 px-3 py-2">
                  No collections yet. Click + to create one!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-2">
          <h3 
            className="text-[10px] font-medium text-[var(--flare-cyan)] uppercase tracking-wider mb-3 cursor-pointer hover:text-[var(--flare-cyan)]/70 transition-colors flex items-center justify-between"
            onClick={() => setTagsExpanded(!tagsExpanded)}
          >
            Tags
            {tagsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </h3>
          
          {tagsExpanded && (
            <div className="space-y-1">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  className={`w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                    selectedTags.includes(tag)
                      ? 'bg-[var(--flare-cyan)]/20 text-[var(--flare-cyan)]'
                      : 'text-[var(--moonlight-silver)]'
                  }`}
                  onClick={() => onTagToggle(tag)}
                  title={`#${tag}`}
                >
                  <span className="truncate">#{tag}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
          
      {/* Recently Deleted - Fixed at bottom */}
      <div className="flex-shrink-0 mt-6">
        <Button
          variant='destructive'
          className={`w-full justify-start gap-3 rounded-lg py-2 px-3  ${
            activeFilter === 'deleted'
              ? 'text-white shadow-sm bg-destructive/90 ' 
              : 'text-destructive hover:bg-destructive/50 hover:text-white'
          }`}
          onClick={() => onFilterChange('deleted')}
          title="Recently Deleted"
        >
          <Trash2 size={16} className="flex-shrink-0" />
          <span className="truncate">Recently Deleted</span>
        </Button>
      </div>

      <NewCollection
        open={isNewCollectionOpen}
        onOpenChange={setIsNewCollectionOpen}
        onSubmit={async (collection) => {
          await handleCreateCollection(collection)
        }}
        availablePrompts={prompts.filter(p => !p.deleted).map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          content: p.content,
          tags: p.tags
        }))}
      />
    </div>
  )
}
