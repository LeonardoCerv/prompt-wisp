'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { X, FolderOpen, Search, Plus } from 'lucide-react'
import { CollectionData } from '@/lib/models'

interface CollectionSearchDropdownProps {
  selectedCollections: string[]
  onCollectionsChange: (collections: CollectionData[]) => void
  placeholder?: string
  className?: string
}

export default function CollectionSearchDropdown({ 
  selectedCollections, 
  onCollectionsChange, 
  placeholder = "Search collections...",
  className = ""
}: CollectionSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allCollections, setAllCollections] = useState<CollectionData[]>([])
  const [filteredCollections, setFilteredCollections] = useState<CollectionData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch collections when component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/collections')
        const data = await response.json()
        
        if (response.ok) {
          setAllCollections(data.collections || [])
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error)
        setAllCollections([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [])

  // Filter collections based on search query
  useEffect(() => {
    const filtered = allCollections.filter((collection) => 
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedCollections.some(selected => selected === collection.id)
    )
    setFilteredCollections(filtered)
  }, [searchQuery, allCollections, selectedCollections])

  const handleSelectCollection = (collection: CollectionData) => {
    // Find all selected CollectionData objects
    const selectedCollectionObjects = [
      ...allCollections.filter(c => selectedCollections.includes(c.id)),
      collection
    ]
    onCollectionsChange(selectedCollectionObjects)
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleRemoveCollection = (collectionId: string) => {
    const updatedCollectionIds = selectedCollections.filter(collection => collection !== collectionId)
    const updatedCollectionObjects = allCollections.filter(c => updatedCollectionIds.includes(c.id))
    onCollectionsChange(updatedCollectionObjects)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
  }

  const getCollectionTitle = (collectionId: string) => {
    const collection = allCollections.find(c => c.id === collectionId)
    return collection ? collection.title : 'Unknown Collection'
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Collections */}
      {selectedCollections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCollections.map((collection) => (
            (<div
              key={collection}
              className="flex items-center gap-2 bg-[var(--warning-amber)]/20 border border-[var(--warning-amber)]/40 rounded-md px-2 py-1 text-xs"
            >
              <FolderOpen className="w-4 h-4 text-[var(--warning-amber)]" />
              <span className="text-white">{getCollectionTitle(collection)}</span>
              <button
                type="button"
                onClick={() => handleRemoveCollection(collection)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            )
            
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300 pr-8"
        />
        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-sm border border-[var(--flare-cyan)]/30 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-white/70">
              Loading collections...
            </div>
          ) : (
            <>
              {/* Existing Collections */}
              {filteredCollections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => handleSelectCollection(collection)}
                  className="w-full px-3 py-2 text-left hover:bg-[var(--wisp-blue)]/20 transition-colors duration-200 flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4 text-[var(--warning-amber)]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {collection.title}
                    </div>
                    {collection.description && (
                      <div className="text-xs text-white/70 truncate">
                        {collection.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}

             
              {/* No Results */}
              {filteredCollections.length === 0 && searchQuery.length > 0 && (
                <div className="px-3 py-2 text-sm text-white/70">
                  No collections found
                </div>
              )}

              {/* Empty State */}
              {allCollections.length === 0 && searchQuery.length === 0 && (
                <div className="px-3 py-2 text-sm text-white/70">
                  No collections yet. Start typing to create one.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
