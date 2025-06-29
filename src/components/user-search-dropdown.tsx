'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { X, Search } from 'lucide-react'

interface UserSearchDropdownProps {
  selectedUsers: string[]
  onUsersChange: (users: string[]) => void
  placeholder?: string
  className?: string
}

export default function UserSearchDropdown({ 
  selectedUsers, 
  onUsersChange, 
  placeholder = "Search users...",
  className = ""
}: UserSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search users with debouncing
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        
        if (response.ok) {
          // Filter out already selected users
          const filteredResults = data.users.filter((user: string) => 
            !selectedUsers.some(selected => selected === user)
          )
          setSearchResults(filteredResults)
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedUsers])

  const handleSelectUser = (user: string) => {
    onUsersChange([...selectedUsers, user])
    setSearchQuery('')
    setSearchResults([])
    setIsOpen(false)
  }

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user !== userId))
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map((user) => (
            <div
              key={user}
              className="flex items-center gap-2 bg-[var(--wisp-blue)]/20 border border-[var(--wisp-blue)]/40 rounded-md px-2 py-1 text-xs"
            >
              {/* 
              {user.profile_picture ? (
                <Image
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-[var(--wisp-blue)]" />
              )}
              <span className="text-white">{user.display}</span>
              */}
              <button
                type="button"
                onClick={() => handleRemoveUser(user)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
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
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => handleSelectUser(user)}
                className="w-full px-3 py-2 text-left hover:bg-[var(--wisp-blue)]/20 transition-colors duration-200 flex items-center gap-2"
              >{/* 
                {user.profile_picture ? (
                  <Image
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-[var(--wisp-blue)]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-white/70 truncate">
                    @{user.username} • {user.email}
                  </div>
                </div>
                */}
              </button>
            ))
          ) : searchQuery.trim().length >= 2 ? (
            <div className="px-3 py-2 text-sm text-white/70">
              No users found
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-white/70">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  )
}
