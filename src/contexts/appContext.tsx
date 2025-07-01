"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from "react"
import { type PromptData, type PromptInsert, type CollectionData, type CollectionInsert, type CollectionUpdate, Collection } from "@/lib/models"
import Prompt from "@/lib/models/prompt"

import UsersPrompts from "@/lib/models/usersPrompts"
import UsersCollections from "@/lib/models/usersCollections"
import CollectionPrompts from "@/lib/models/collectionPrompts"
import type { User } from "@supabase/supabase-js"

// Types
interface AppState {
  prompts: PromptData[]
  collections: CollectionData[]
  user: User | null
  tags: string[]
  userPrompts: string[] // Prompt IDs the user has access to
  userCollections: string[] // Collection IDs the user has access to
  favoritePrompts: string[] // Favorite prompt IDs
  favoriteCollections: string[] // Favorite collection IDs
  promptCollectionMap: Record<string, string[]> // promptId -> collectionIds
  collectionPromptMap: Record<string, string[]> // collectionId -> promptIds
  userRoles: {
    prompts: Record<string, "owner" | "buyer" | "collaborator"> // promptId -> role
    collections: Record<string, "owner" | "buyer" | "collaborator"> // collectionId -> role
  }
  loading: {
    prompts: boolean
    collections: boolean
    user: boolean
    tags: boolean
    relationships: boolean
  }
  filters: {
    selectedFilter: string
    selectedCollection?: string
    selectedTags: string[]
  }
  ui: {
    collectionsExpanded: boolean
    tagsExpanded: boolean
    selectedPrompt: PromptData | null
  }
}

type AppAction =
  | { type: "SET_PROMPTS"; payload: PromptData[] }
  | { type: "ADD_PROMPT"; payload: PromptData }
  | { type: "UPDATE_PROMPT"; payload: PromptData }
  | { type: "DELETE_PROMPT"; payload: string }
  | { type: "SET_COLLECTIONS"; payload: CollectionData[] }
  | { type: "ADD_COLLECTION"; payload: CollectionData }
  | { type: "UPDATE_COLLECTION"; payload: CollectionData }
  | { type: "DELETE_COLLECTION"; payload: string }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "SET_USER_PROMPTS"; payload: string[] }
  | { type: "SET_USER_COLLECTIONS"; payload: string[] }
  | { type: "SET_FAVORITE_PROMPTS"; payload: string[] }
  | { type: "SET_FAVORITE_COLLECTIONS"; payload: string[] }
  | { type: "SET_PROMPT_COLLECTION_MAP"; payload: Record<string, string[]> }
  | { type: "SET_COLLECTION_PROMPT_MAP"; payload: Record<string, string[]> }
  | {
      type: "SET_USER_ROLES"
      payload: {
        prompts?: Record<string, "owner" | "buyer" | "collaborator">
        collections?: Record<string, "owner" | "buyer" | "collaborator">
      }
    }
  | { type: "SET_LOADING"; payload: { key: keyof AppState["loading"]; value: boolean } }
  | { type: "SET_FILTER"; payload: { selectedFilter: string; selectedCollection?: string; selectedTags?: string[] } }
  | { type: "SET_UI"; payload: Partial<AppState["ui"]> }

const initialState: AppState = {
  prompts: [],
  collections: [],
  user: null,
  tags: [],
  userPrompts: [],
  userCollections: [],
  favoritePrompts: [],
  favoriteCollections: [],
  promptCollectionMap: {},
  collectionPromptMap: {},
  userRoles: {
    prompts: {},
    collections: {},
  },
  loading: {
    prompts: false,
    collections: false,
    user: false,
    tags: false,
    relationships: false,
  },
  filters: {
    selectedFilter: "home",
    selectedCollection: undefined,
    selectedTags: [],
  },
  ui: {
    collectionsExpanded: false,
    tagsExpanded: false,
    selectedPrompt: null,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_PROMPTS":
      return { ...state, prompts: action.payload }

    case "ADD_PROMPT":
      return { ...state, prompts: [action.payload, ...state.prompts] }

    case "UPDATE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }

    case "DELETE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.map((p) => (p.id === action.payload ? { ...p, deleted: true } : p)),
      }

    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload }

    case "ADD_COLLECTION":
      return { ...state, collections: [action.payload, ...state.collections] }

    case "UPDATE_COLLECTION":
      return {
        ...state,
        collections: state.collections.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }

    case "DELETE_COLLECTION":
      return {
        ...state,
        collections: state.collections.map((c) => (c.id === action.payload ? { ...c, deleted: true } : c)),
      }

    case "SET_USER":
      return { ...state, user: action.payload }

    case "SET_TAGS":
      return { ...state, tags: action.payload }

    case "SET_USER_PROMPTS":
      return { ...state, userPrompts: action.payload }

    case "SET_USER_COLLECTIONS":
      return { ...state, userCollections: action.payload }

    case "SET_FAVORITE_PROMPTS":
      return { ...state, favoritePrompts: action.payload }

    case "SET_FAVORITE_COLLECTIONS":
      return { ...state, favoriteCollections: action.payload }

    case "SET_PROMPT_COLLECTION_MAP":
      return { ...state, promptCollectionMap: action.payload }

    case "SET_COLLECTION_PROMPT_MAP":
      return { ...state, collectionPromptMap: action.payload }

    case "SET_USER_ROLES":
      return {
        ...state,
        userRoles: {
          prompts: { ...state.userRoles.prompts, ...action.payload.prompts },
          collections: { ...state.userRoles.collections, ...action.payload.collections },
        },
      }

    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }

    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }

    case "SET_UI":
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  actions: {
    // Data fetching
    loadPrompts: () => Promise<void>
    loadCollections: () => Promise<void>
    loadUser: () => Promise<void>
    loadTags: () => Promise<void>
    loadUserRelationships: () => Promise<void>

    // Prompt operations
    createPrompt: (prompt: PromptInsert) => Promise<PromptData>
    updatePrompt: (id: string, updates: Partial<PromptData>) => Promise<void>
    deletePrompt: (id: string) => Promise<void>
    restorePrompt: (id: string) => Promise<void>
    toggleFavoritePrompt: (id: string) => Promise<void>
    savePrompt: (id: string, role?: string) => Promise<void>
    savePromptChanges: (id: string, updates: Partial<PromptData>) => Promise<void>

    // Collection operations
    createCollection: (collection: CollectionInsert) => Promise<CollectionData>
    updateCollection: (id: string, updates: Partial<CollectionUpdate>) => Promise<void>
    editCollection: (id: string, updates: Partial<CollectionUpdate>) => Promise<void>
    deleteCollection: (id: string) => Promise<void>
    toggleFavoriteCollection: (id: string) => Promise<void>
    addPromptToCollection: (collectionId: string, promptIds: string[]) => Promise<void>
    removePromptFromCollection: (collectionId: string, promptId: string) => Promise<void>

    // UI actions
    setFilter: (filter: string, options?: { collection?: string; tags?: string[] }) => void
    setSelectedPrompt: (prompt: PromptData | null) => void
    toggleCollectionsExpanded: () => void
    toggleTagsExpanded: () => void
  }
  utils: {
    // Prompt status utilities (now synchronous)
    isOwner: (prompt: PromptData, userId?: string) => boolean
    isFavorite: (promptId: string, userId?: string) => boolean
    isFavoritePrompt: (promptId: string) => boolean
    isFavoriteCollection: (collectionId: string) => boolean
    isSaved: (promptId: string, userId?: string) => boolean
    hasAccessToPrompt: (promptId: string) => boolean
    hasAccessToCollection: (collectionId: string) => boolean
    isDeleted: (item: PromptData | CollectionData) => boolean
    canEdit: (prompt: PromptData, userId?: string) => boolean
    canView: (prompt: PromptData, userId?: string) => boolean

    // User relationship utilities
    getUserPrompts: (userId?: string) => PromptData[]
    getUserCollections: (userId?: string) => CollectionData[]
    getUserOwnedPrompts: (userId?: string) => PromptData[]
    getUserFavoritePrompts: (userId?: string) => PromptData[]
    getUserSavedPrompts: (userId?: string) => PromptData[]

    // Collection utilities
    getCollectionPrompts: (collectionId: string) => PromptData[]
    getPromptCollections: (promptId: string) => CollectionData[]

    // Filtering utilities
    getFilteredPrompts: (filter: string, collection?: string, tags?: string[]) => PromptData[]

    // General utilities
    formatDate: (dateString: string) => string
    truncateText: (text: string, maxLength: number) => string
  }
  search: {
    searchPrompts: (query: string) => PromptData[]
  }
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Data loading functions
  const loadPrompts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "prompts", value: true } })
    try {
      const response = await fetch("/api/user/prompts")
      if (response.ok) {
        const data = await response.json()

        // For each prompt in data, call await Prompt.findById(prompt)
        // and return the array of objects
        const promptsRaw = data.prompts || data || []
        const prompts: PromptData[] = []
        for (const prompt of promptsRaw) {
          // If prompt is an id, fetch the full object
          if (typeof prompt === "string") {
            const fullPrompt = await Prompt.findById(prompt)
            if (fullPrompt) prompts.push(fullPrompt)
          } else {
            prompts.push(prompt)
          }
        }
        // Sort: non-deleted first (by updated_at desc), then deleted (by updated_at desc)
        const sortedPrompts = [
          ...prompts
            .filter((p) => !p.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
          ...prompts
            .filter((p) => p.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        ]

        dispatch({ type: "SET_PROMPTS", payload: sortedPrompts })
      }
    } catch (error) {
      console.error("Error loading prompts:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "prompts", value: false } })
    }
  }, [])

  const loadCollections = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "collections", value: true } })
    try {
      const response = await fetch("/api/user/collections")
      if (response.ok) {
        const data = await response.json()

        // For each prompt in data, call await Prompt.findById(prompt)
        // and return the array of objects
        const collectionsRaw = data.collection || data || []
        const collections: CollectionData[] = []
        for (const collection of collectionsRaw) {
          // If prompt is an id, fetch the full object
          if (typeof collection === "string") {
            const fullPrompt = await Collection.findById(collection)
            if (fullPrompt) collections.push(fullPrompt)
          } else {
            collections.push(collection)
          }
        }
        // Sort: non-deleted first, then deleted
        const sortedCollections = [
          ...collections.filter((p) => !p.deleted)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        ]

        dispatch({ type: "SET_COLLECTIONS", payload: sortedCollections})
      }
    } catch (error) {
      console.error("Error loading collections:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "collections", value: false } })
    }
  }, [])

  const loadUser = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "user", value: true } })
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: "SET_USER", payload: data })
      }
    } catch (error) {
      console.error("Error loading user:", error)
      dispatch({ type: "SET_USER", payload: null })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "user", value: false } })
    }
  }, [])

  const loadTags = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "tags", value: true } })
    try {
     const response = await fetch("/api/user/prompts")
      if (response.ok) {
        const data = await response.json()

        // For each prompt in data, call await Prompt.findById(prompt)
        // and return the array of objects
        const tags = await Prompt.findAllTags(data)

        dispatch({ type: "SET_TAGS", payload: tags })
      }
    } catch (error) {
      console.error("Error loading tags:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "tags", value: false } })
    }
  }, [])

  const loadUserRelationships = useCallback(async () => {
    if (!state.user?.id) return

    dispatch({ type: "SET_LOADING", payload: { key: "relationships", value: true } })
    try {
      // Load user prompts
      const userPrompts = await UsersPrompts.getPrompts(state.user.id)
      dispatch({ type: "SET_USER_PROMPTS", payload: userPrompts })

      // Load user collections
      const userCollections = await UsersCollections.getCollections(state.user.id)
      dispatch({ type: "SET_USER_COLLECTIONS", payload: userCollections })

      // Load favorite prompts
      const favoritePrompts = await UsersPrompts.getFavorites(state.user.id)
      dispatch({ type: "SET_FAVORITE_PROMPTS", payload: favoritePrompts })

      // Load favorite collections
      const favoriteCollections = await UsersCollections.getFavorites(state.user.id)
      dispatch({ type: "SET_FAVORITE_COLLECTIONS", payload: favoriteCollections })

      // Load user roles for prompts and collections
      const promptRoles: Record<string, "owner" | "buyer" | "collaborator"> = {}
      const collectionRoles: Record<string, "owner" | "buyer" | "collaborator"> = {}

      // Get roles for each user prompt
      for (const promptId of userPrompts) {
        try {
          const role = await UsersPrompts.getUserRole(promptId, state.user.id)
          if (role) promptRoles[promptId] = role
        } catch (error) {
          console.error(`Error loading role for prompt ${promptId}:`, error)
        }
      }

      // Get roles for each user collection
      for (const collectionId of userCollections) {
        try {
          const role = await UsersCollections.getUserRole(collectionId, state.user.id)
          if (role) collectionRoles[collectionId] = role
        } catch (error) {
          console.error(`Error loading role for collection ${collectionId}:`, error)
        }
      }

      dispatch({ type: "SET_USER_ROLES", payload: { prompts: promptRoles, collections: collectionRoles } })

      // Load prompt-collection relationships
      const promptCollectionMap: Record<string, string[]> = {}
      const collectionPromptMap: Record<string, string[]> = {}

      // For each user prompt, get its collections
      for (const promptId of userPrompts) {
        try {
          const collections = await CollectionPrompts.getCollections(promptId)
          promptCollectionMap[promptId] = collections
        } catch (error) {
          console.error(`Error loading collections for prompt ${promptId}:`, error)
          promptCollectionMap[promptId] = []
        }
      }

      // For each user collection, get its prompts
      for (const collectionId of userCollections) {
        try {
          const prompts = await CollectionPrompts.getPrompts(collectionId)
          collectionPromptMap[collectionId] = prompts
        } catch (error) {
          console.error(`Error loading prompts for collection ${collectionId}:`, error)
          collectionPromptMap[collectionId] = []
        }
      }

      dispatch({ type: "SET_PROMPT_COLLECTION_MAP", payload: promptCollectionMap })
      dispatch({ type: "SET_COLLECTION_PROMPT_MAP", payload: collectionPromptMap })
    } catch (error) {
      console.error("Error loading user relationships:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "relationships", value: false } })
    }
  }, [state.user?.id])

  // Prompt operations
  const createPrompt = useCallback(
    async (promptData: PromptInsert): Promise<PromptData> => {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create prompt")
      }

      const newPrompt = await response.json()
      dispatch({ type: "ADD_PROMPT", payload: newPrompt })

      // Reload user relationships to include the new prompt
      await loadUserRelationships()

      return newPrompt
    },
    [loadUserRelationships],
  )

  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptData>) => {
    const response = await fetch(`/api/prompts/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id, updates}),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt")
    }

    const updatedPrompt = await response.json()
    dispatch({ type: "UPDATE_PROMPT", payload: updatedPrompt })
  }, [])

  const deletePrompt = useCallback(async (id: string) => {
    const response = await fetch(`/api/prompts`, {
      method: "DELETE",
      body: JSON.stringify({prompt_id: id}),
    })

    if (!response.ok) {
      throw new Error("Failed to delete prompt")
    }

    dispatch({ type: "DELETE_PROMPT", payload: id })
  }, [])

  const restorePrompt = useCallback(
    async (id: string) => {
      const response = await fetch("/api/prompts/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, updates: { deleted: false } }),
      })

      if (!response.ok) {
        throw new Error("Failed to restore prompt")
      }

      await loadPrompts()
    },
    [loadPrompts],
  )

  const toggleFavoritePrompt = useCallback(
    async (id: string) => {
      try {
        if (!state.user) {
          throw new Error("User not authenticated")
        }

        const isFav = state.favoritePrompts.includes(id)
        await UsersPrompts.updateFavorite(id, state.user.id, !isFav)

        // Update local state
        const updatedFavorites = isFav
          ? state.favoritePrompts.filter((fId) => fId !== id)
          : [...state.favoritePrompts, id]

        dispatch({ type: "SET_FAVORITE_PROMPTS", payload: updatedFavorites })
      } catch (error) {
        console.error("Error toggling favorite:", error)
        throw error
      }
    },
    [state.user, state.favoritePrompts],
  )

  const savePrompt = useCallback(
    async (id: string, role: string = "buyer") => {
      if (state.userRoles.prompts[id] === role) {
        // Already has this role, no need to save again
        return
      }
      const response = await fetch("/api/user/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_id: id, user_role: role }),
      })

      if (!response.ok) {
        throw new Error("Failed to save prompt")
      }

      await loadUserRelationships()
    },
    [loadUserRelationships],
  )

  const savePromptChanges = useCallback(async (id: string, updates: Partial<PromptData>) => {
    const response = await fetch(`/api/prompts/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt")
    }

    const updatedPrompt = await response.json()
    dispatch({ type: "UPDATE_PROMPT", payload: updatedPrompt })
  }, [])

  // Collection operations
  const createCollection = useCallback(
    async (collectionData: CollectionInsert): Promise<CollectionData> => {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create collection")
      }

      const newCollection = await response.json()
      dispatch({ type: "ADD_COLLECTION", payload: newCollection })

      // Reload user relationships to include the new collection
      await loadUserRelationships()

      return newCollection
    },
    [loadUserRelationships],
  )

  const updateCollection = useCallback(async (id: string, updates: Partial<CollectionUpdate>) => {
    const response = await fetch(`/api/collections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    })

    if (!response.ok) throw new Error("Failed to update collection")

    const updatedCollection = await response.json()
    dispatch({ type: "UPDATE_COLLECTION", payload: updatedCollection })
  }, [])

  const deleteCollection = useCallback(async (id: string) => {
    const response = await fetch(`/api/collections`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) throw new Error("Failed to delete collection")

    dispatch({ type: "DELETE_COLLECTION", payload: id })
  }, [])

  const toggleFavoriteCollection = useCallback(
    async (id: string) => {
      try {
        if (!state.user) {
          throw new Error("User not authenticated")
        }

        const isFav = state.favoriteCollections.includes(id)
        await UsersCollections.updateFavorite(id, state.user.id, !isFav)

        // Update local state
        const updatedFavorites = isFav
          ? state.favoriteCollections.filter((fId) => fId !== id)
          : [...state.favoriteCollections, id]

        dispatch({ type: "SET_FAVORITE_COLLECTIONS", payload: updatedFavorites })
      } catch (error) {
        console.error("Error toggling collection favorite:", error)
        throw error
      }
    },
    [state.user, state.favoriteCollections],
  )

  const addPromptToCollection = useCallback(
    async (collectionId: string, promptIds: string[]) => {
      try {
        // Add each prompt to the collection using the intermediary table
        for (const promptId of promptIds) {
          await CollectionPrompts.create({
            collection_id: collectionId,
            prompt_id: promptId,
          })
        }

        // Reload relationships to update the maps
        await loadUserRelationships()
      } catch (error) {
        console.error("Error adding prompts to collection:", error)
        throw error
      }
    },
    [loadUserRelationships],
  )

  const removePromptFromCollection = useCallback(
    async (collectionId: string, promptId: string) => {
      try {
        await CollectionPrompts.delete(promptId, collectionId)
        await loadUserRelationships()
      } catch (error) {
        console.error("Error removing prompt from collection:", error)
        throw error
      }
    },
    [loadUserRelationships],
  )

  // UI actions
  const setFilter = useCallback((filter: string, options?: { collection?: string; tags?: string[] }) => {
    dispatch({
      type: "SET_FILTER",
      payload: {
        selectedFilter: filter,
        selectedCollection: options?.collection,
        selectedTags: options?.tags || [],
      },
    })
  }, [])

  const setSelectedPrompt = useCallback((prompt: PromptData | null) => {
    dispatch({ type: "SET_UI", payload: { selectedPrompt: prompt } })
  }, [])

  const toggleCollectionsExpanded = useCallback(() => {
    dispatch({ type: "SET_UI", payload: { collectionsExpanded: !state.ui.collectionsExpanded } })
  }, [state.ui.collectionsExpanded])

  const toggleTagsExpanded = useCallback(() => {
    dispatch({ type: "SET_UI", payload: { tagsExpanded: !state.ui.tagsExpanded } })
  }, [state.ui.tagsExpanded])

  // Load initial data and user relationships when user changes
  useEffect(() => {
    loadPrompts()
    loadCollections()
    loadUser()
    loadTags()
  }, [loadPrompts, loadCollections, loadUser, loadTags])

  useEffect(() => {
    if (state.user?.id) {
      loadUserRelationships()
    }
  }, [state.user?.id, loadUserRelationships])

  // Utility functions (now synchronous using cached state)
  const utils = useMemo(
    () => ({
      // Prompt status utilities - now synchronous using cached roles
      isOwner: (prompt: PromptData, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        return state.userRoles.prompts[prompt.id] === "owner"
      },

      isFavorite: (promptId: string, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        return state.favoritePrompts.includes(promptId)
      },

      isFavoritePrompt: (promptId: string): boolean => {
        return state.favoritePrompts.includes(promptId)
      },

      isFavoriteCollection: (collectionId: string): boolean => {
        return state.favoriteCollections.includes(collectionId)
      },

      isSaved: (promptId: string, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false

        // Check if user has access to this prompt
        const hasAccess = state.userPrompts.includes(promptId)
        if (!hasAccess) return false

        // Check if user is not the owner (saved means has access but doesn't own)
        const role = state.userRoles.prompts[promptId]
        return role !== "owner" && role !== undefined
      },

      hasAccessToPrompt: (promptId: string): boolean => {
        return state.userPrompts.includes(promptId)
      },

      hasAccessToCollection: (collectionId: string): boolean => {
        return state.userCollections.includes(collectionId)
      },

      isDeleted: (item: PromptData | CollectionData): boolean => {
        return item.deleted || false
      },

      canEdit: (prompt: PromptData, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        if (prompt.deleted) return false

        const role = state.userRoles.prompts[prompt.id]
        return role === "owner" || role === "collaborator"
      },

      canView: (prompt: PromptData, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id

        // Public prompts can be viewed by anyone
        if (prompt.visibility === "public") return true

        // If no user, can only view public prompts
        if (!currentUserId) return false

        // Check if user has access to this prompt
        return state.userPrompts.includes(prompt.id)
      },

      // User relationship utilities - using state arrays
      getUserPrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []
        return state.prompts.filter((p) => state.userPrompts.includes(p.id) && !p.deleted)
      },

      getUserCollections: (userId?: string): CollectionData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []
        return state.collections.filter((c) => state.userCollections.includes(c.id) && !c.deleted)
      },

      getUserOwnedPrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []

        return state.prompts.filter((p) => {
          const hasAccess = state.userPrompts.includes(p.id)
          const isOwner = state.userRoles.prompts[p.id] === "owner"
          return hasAccess && isOwner && !p.deleted
        })
      },

      getUserFavoritePrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []
        return state.prompts.filter((p) => state.favoritePrompts.includes(p.id) && !p.deleted)
      },

      getUserSavedPrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []

        return state.prompts.filter((p) => {
          const hasAccess = state.userPrompts.includes(p.id)
          const role = state.userRoles.prompts[p.id]
          const isSaved = role !== "owner" && role !== undefined
          return hasAccess && isSaved && !p.deleted
        })
      },

      // Collection utilities
      getCollectionPrompts: (collectionId: string): PromptData[] => {
        const promptIds = state.collectionPromptMap[collectionId] || []
        return state.prompts.filter((prompt) => promptIds.includes(prompt.id) && !prompt.deleted)
      },

      getPromptCollections: (promptId: string): CollectionData[] => {
        const collectionIds = state.promptCollectionMap[promptId] || []
        return state.collections.filter((collection) => collectionIds.includes(collection.id) && !collection.deleted)
      },

      // Filtering utilities
      getFilteredPrompts: (filter: string, collection?: string, tags?: string[]): PromptData[] => {
        const userId = state.user?.id
        if (!userId) return []

        let filtered: PromptData[] = []

        switch (filter) {
          case "home":
            // Show all prompts user has access to
            filtered = state.prompts.filter((p) => state.userPrompts.includes(p.id) && !p.deleted)
            break

          case "owned":
            filtered = state.prompts.filter((p) => {
              const hasAccess = state.userPrompts.includes(p.id)
              const isOwner = state.userRoles.prompts[p.id] === "owner"
              return hasAccess && isOwner && !p.deleted
            })
            break

          case "saved":
            filtered = state.prompts.filter((p) => {
              const hasAccess = state.userPrompts.includes(p.id)
              const role = state.userRoles.prompts[p.id]
              const isSaved = role !== "owner" && role !== undefined
              return hasAccess && isSaved && !p.deleted
            })
            break

          case "favorites":
            filtered = state.prompts.filter((p) => state.favoritePrompts.includes(p.id) && !p.deleted)
            break

          case "collection":
            if (collection) {
              const promptIds = state.collectionPromptMap[collection] || []
              filtered = state.prompts.filter((prompt) => promptIds.includes(prompt.id) && !prompt.deleted)
            } else {
              filtered = []
            }
            break

          case "deleted":
            // Show deleted prompts user has access to
            filtered = state.prompts.filter((p) => state.userPrompts.includes(p.id) && p.deleted)
            break

          default:
            filtered = state.prompts.filter((p) => state.userPrompts.includes(p.id) && !p.deleted)
            break
        }

        // Apply tag filters
        if (tags && tags.length > 0) {
          filtered = filtered.filter((prompt) => tags.some((tag) => prompt.tags?.includes(tag)))
        }

        return filtered
      },

      // General utilities
      formatDate: (dateString: string): string => {
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        } catch {
          return "Unknown date"
        }
      },

      truncateText: (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
      },
    }),
    [
      state.user,
      state.prompts,
      state.collections,
      state.userPrompts,
      state.userCollections,
      state.favoritePrompts,
      state.favoriteCollections,
      state.promptCollectionMap,
      state.collectionPromptMap,
      state.userRoles,
    ],
  )

  // Search utility for prompts
  const searchPrompts = useCallback(
    (query: string) => {
      const userId = state.user?.id
      if (!userId) return []

      // Filter prompts user has access to
      const accessiblePrompts = state.prompts

      const q = query.trim().toLowerCase()
      if (!q) return accessiblePrompts

      if (q.startsWith("#")) {
        const tagQuery = q.slice(1)
        return accessiblePrompts.filter((p) => p.tags && p.tags.some((tag) => tag.toLowerCase().includes(tagQuery)))
      } else {
        return accessiblePrompts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description?.toLowerCase().includes(q) ?? false) ||
            (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q))),
        )
      }
    },
    [state.prompts, state.user],
  )

  // Add the editCollection implementation:
  const editCollection = useCallback(
    async (id: string, updates: Partial<CollectionUpdate>) => {
      try {
        await updateCollection(id, updates)
      } catch (error) {
        console.error("Error editing collection:", error)
        throw error
      }
    },
    [updateCollection],
  )

  // Memoize the actions object to prevent infinite re-renders
  const contextActions = useMemo(
    () => ({
      loadPrompts,
      loadCollections,
      loadUser,
      loadTags,
      loadUserRelationships,
      createPrompt,
      updatePrompt,
      deletePrompt,
      restorePrompt,
      toggleFavoritePrompt,
      savePrompt,
      savePromptChanges,
      createCollection,
      updateCollection,
      editCollection,
      deleteCollection,
      toggleFavoriteCollection,
      addPromptToCollection,
      removePromptFromCollection,
      setFilter,
      setSelectedPrompt,
      toggleCollectionsExpanded,
      toggleTagsExpanded,
    }),
    [
      loadPrompts,
      loadCollections,
      loadUser,
      loadTags,
      loadUserRelationships,
      createPrompt,
      updatePrompt,
      deletePrompt,
      restorePrompt,
      toggleFavoritePrompt,
      savePrompt,
      savePromptChanges,
      createCollection,
      updateCollection,
      editCollection,
      deleteCollection,
      toggleFavoriteCollection,
      addPromptToCollection,
      removePromptFromCollection,
      setFilter,
      setSelectedPrompt,
      toggleCollectionsExpanded,
      toggleTagsExpanded,
    ],
  )

  const contextValue: AppContextType = useMemo(
    () => ({
      state,
      actions: contextActions,
      utils,
      search: { searchPrompts },
    }),
    [state, contextActions, utils, searchPrompts],
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
