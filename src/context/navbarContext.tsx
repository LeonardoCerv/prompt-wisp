'use client'

import { CollectionData, PromptData, User, UserData } from '@/lib/models';
import { createClient } from '@/lib/utils/supabase/server';
import { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner';

type NavbarType = {
  usePromptState: (initialPrompts?: PromptData[] ) => {prompts: PromptData[],
    setPrompts: (prompts: PromptData[]) => void,
    filteredPrompts: PromptData[],
    setFilteredPrompts: (prompts: PromptData[]) => void,
    searchTerm: string,
    setSearchTerm: (term: string) => void,
    activeFilter: string,
    setActiveFilter: (filter: string) => void,
    selectedTags: string[],
    setSelectedTags: (tags: string[]) => void,
    selectedPrompt: PromptData | null,
    setSelectedPrompt: (prompt: PromptData | null) => void,
    allTags: string[],
    setAllTags: (tags: string[]) => void,
    loading: boolean,
    setLoading: (loading: boolean) => void,
    toggleTag: (tag: string) => void,
    selectPrompt: (prompt: PromptData | null) => void
  },
  filterPromptsByFavorites: (prompts: PromptData[], user: UserData) => PromptData[];
  filterPromptsByOwner: (prompts: PromptData[], user: UserData) => PromptData[];
  filterPromptsBySaved: (prompts: PromptData[], user: UserData) => PromptData[];
  filterPromptsByCollections: (prompts: PromptData[], collectionId: string) => PromptData[];
  filterPromptsByTags: (prompts: PromptData[], tags: string[]) => PromptData[];
  filterPromptsBySearch: (prompts: PromptData[], searchTerm: string) => PromptData[];
  checkIsOwner: (prompt: PromptData, userId: string) => boolean;
  copyToClipboard: (content: string, title: string) => void;
  isMidbarExpanded: (activeFilter: string) => boolean;
  createNewPrompt: (newPrompt: {
    title: string,
    description: string,
    tags: string,
    content: string,
    visibility?: 'public' | 'private' | 'unlisted',
    images?: string[],
    collaborators?: string[],
    collections?: string[]
  }, onSuccess?: (promptId: string) => void) => Promise<PromptData>;
  refreshPrompts: () => Promise<PromptData[]>;
  loadTags: () => Promise<string[]>;
  savePrompt: (id: string) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  restorePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

}

const defaultNavbar: NavbarType = {

  // Custom hook to manage prompt state
  // This hook initializes and manages the state related to prompts, including filtering, searching, and
  // selecting prompts. It returns an object containing the state and functions to manipulate it.
  // Params: initialPrompts - An optional array of initial prompts to set the state
  // Returns: an object containing the state and functions to manipulate it
  // Example usage:
  // const { prompts, setPrompts, filteredPrompts, setFilteredPrompts,
  //         searchTerm, setSearchTerm, activeFilter, setActiveFilter,
  //         selectedTags, setSelectedTags, selectedPrompt, setSelectedPrompt,
  //         allTags, setAllTags, loading, setLoading, toggleTag, select
  usePromptState: (initialPrompts: PromptData[] = []) => {
    const [prompts, setPrompts] = useState<PromptData[]>(initialPrompts)
    const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
    const [allTags, setAllTags] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
  
    const toggleTag = useCallback((tag: string) => {
      setSelectedTags(prev =>
        prev.includes(tag)
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      )
    }, [])
  
    const selectPrompt = useCallback((prompt: PromptData | null) => {
      setSelectedPrompt(prompt)
    }, [])
  
    return {
      prompts,
      setPrompts,
      filteredPrompts,
      setFilteredPrompts,
      searchTerm,
      setSearchTerm,
      activeFilter,
      setActiveFilter,
      selectedTags,
      setSelectedTags,
      selectedPrompt,
      setSelectedPrompt,
      allTags,
      setAllTags,
      loading,
      setLoading,
      toggleTag,
      selectPrompt
    }
  },

  // Function to save or unsave a prompt
  // This function sends a POST request to the server to toggle the saved state of a prompt
  // {arams: id - The ID of the prompt to save or unsave
  // Returns: a promise that resolves when the operation is complete
  savePrompt: async (id: string) => {
    try {
      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (response.ok) {
        const { isSaved } = await response.json()
        toast.success(isSaved ? 'Prompt saved' : 'Prompt unsaved')
      } else {
        toast.error('Failed to save prompt')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    }
  },

  // Function to delete a prompt
  // This function sends a DELETE request to the server to move a prompt to the "Recently Deleted" state
  // Params: id - The ID of the prompt to delete
  // Returns: a promise that resolves when the operation is complete
  deletePrompt: async(id: string) =>{
    try {
      const response = await fetch(`/api/prompts?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Prompt moved to Recently Deleted')
      } else {
        toast.error('Failed to delete prompt')
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  },

  // Function to restore a prompt from the "Recently Deleted" state
  // This function sends a POST request to the server to restore a deleted prompt
  // Params: id - The ID of the prompt to restore
  // Returns: a promise that resolves when the operation is complete
  restorePrompt: async(id: string) =>{
    try {
      const response = await fetch('/api/prompts/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (response.ok) {
        toast.success('Prompt restored')
      } else {
        toast.error('Failed to restore prompt')
      }
    } catch (error) {
      console.error('Error restoring prompt:', error)
      toast.error('Failed to restore prompt')
    }
  },

  // Function to toggle the favorite status of a prompt
  // This function sends a POST request to the server to toggle the favorite state of a prompt
  // Params: id - The ID of the prompt to toggle favorite status
  // Returns: a promise that resolves when the operation is complete
  toggleFavorite: async(id: string) => {
    try {
      const response = await fetch('/api/prompts/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (!response.ok) {
        toast.error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to toggle favorite')
    }
  },

  // Function to create a new prompt
  // This function sends a POST request to the server to create a new prompt with the provided data.
  // Params: newPrompt - An object containing the prompt data
  // Returns: a promise that resolves to the created prompt object
  createNewPrompt: async(newPrompt: {
    title: string
    description: string
    tags: string
    content: string
    visibility?: 'public' | 'private' | 'unlisted'
    images?: string[]
    collaborators?: string[]
    collections?: string[]
  }, onSuccess?: (promptId: string) => void) => {
    try {
      console.log('Creating prompt with data:', newPrompt);
      
      const requestBody = {
        title: newPrompt.title.trim(),
        description: newPrompt.description.trim() || null,
        content: newPrompt.content.trim(),
        tags: newPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        visibility: newPrompt.visibility || 'private',
        images: newPrompt.images || null,
        collaborators: newPrompt.collaborators || null,
        collections: newPrompt.collections || null
      };
      
      console.log('Request body:', requestBody);
  
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
  
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
  
      if (response.ok) {
        const createdPrompt = await response.json()
        console.log('Created prompt:', createdPrompt);
        toast.success('Prompt created successfully')
        if (onSuccess) {
          onSuccess(createdPrompt.id)
        }
        return createdPrompt
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData);
        toast.error(errorData.error || 'Failed to create prompt')
        throw new Error(errorData.error || 'Failed to create prompt')
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Failed to create prompt')
      throw error
    }
  },

  // Function to refresh the list of prompts
  // This function fetches the user's prompts from the server
  // Params: none
  // Returns: a promise that resolves to an array of prompts
  refreshPrompts: async() =>{
    try {
      const response = await fetch('/api/prompts/user')
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Failed to load prompts')
        return []
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
      return []
    }
  },

  // Function to load tags for prompts
  // This function fetches the available tags from the server
  // Params: none
  // Returns: a promise that resolves to an array of tags
  loadTags: async() => {
    try {
      const response = await fetch('/api/prompts/tags')
      if (response.ok) {
        return await response.json()
      } else {
        return []
      }
    } catch (error) {
      console.error('Error loading tags:', error)
      return []
    }
  },

  // Function to filter prompts by favorite status
  // Params: prompts - The array of prompts to filter, user - The current user data
  // Returns: an array of prompts that match the favorite status
  filterPromptsByFavorites: (prompts: PromptData[], user: UserData): PromptData[] => {
    return prompts.filter(prompt => user.favorites && user.favorites.includes(prompt.id) && !prompt.deleted)
  },

  filterPromptsByOwner: (prompts: PromptData[], user: UserData): PromptData[] => {
    return prompts.filter(prompt => prompt.user_id === user.id && !prompt.deleted)
  },

  filterPromptsBySaved: (prompts: PromptData[], user: UserData): PromptData[] => {
    return prompts.filter(prompt => user.bought && user.bought.includes(prompt.id) && !prompt.deleted)
  },

  filterPromptsByCollections: (prompts: PromptData[], collectionId: string): PromptData[] => {
    return prompts.filter(prompt => prompt.collections && prompt.collections.includes(collectionId) && !prompt.deleted)
  },

  filterPromptsByTags: (prompts: PromptData[], tags: string[]): PromptData[] => {
    if (tags.length === 0) return prompts
    return prompts.filter(prompt =>
      prompt.tags && prompt.tags.some(tag => tags.includes(tag)) && !prompt.deleted
    )
  },

  filterPromptsBySearch: (prompts: PromptData[], searchTerm: string): PromptData[] => {
    if (!searchTerm) return prompts
    const lowerSearchTerm = searchTerm.toLowerCase()
    return prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(lowerSearchTerm) ||
      (prompt.description && prompt.description.toLowerCase().includes(lowerSearchTerm)) ||
      prompt.content.toLowerCase().includes(lowerSearchTerm) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) &&
      !prompt.deleted
    )
  },

  checkIsOwner:(prompt: PromptData, userId: string): boolean => {
    return prompt.user_id === userId
  },

  // Function to copy prompt content to clipboard
  // Params: content: The content to copy, title: The title of the prompt
  // Returns: void
  copyToClipboard: (content: string, title: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success(`"${title}" copied to clipboard`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  },

  // Function to check if the midbar is expanded based on the active filter
  // Params: activeFilter: The currently active filter
  // Returns: boolean indicating if the midbar is expanded
  isMidbarExpanded: (activeFilter: string): boolean => {
    return activeFilter !== 'all'
  },


}

const NavbarContext = createContext<NavbarType>(defaultNavbar)

export const NavbarProvider = ({children} : {children: React.ReactNode}) => {
      return (
    <NavbarContext.Provider value={defaultNavbar}>
      {children}
    </NavbarContext.Provider>
  )
}

export const useNavbar = () => useContext(NavbarContext);