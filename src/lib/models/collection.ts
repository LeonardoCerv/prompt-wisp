import { createClient } from "@/lib/utils/supabase/client"

type VisibilityType = "public" | "private" | "unlisted"

// Core Collection interface matching Supabase schema
export interface CollectionData {
  id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
  visibility: VisibilityType
  deleted: boolean
}

// Interface for creating new collections
export interface CollectionInsert {
  id?: string
  title?: string
  description?: string
  images?: string[]
  tags?: string[]
  visibility?: VisibilityType
  deleted?: boolean
  created_at?: string
  updated_at?: string
}

// Interface for updating existing collections
export interface CollectionUpdate {
  id?: string
  title?: string
  description?: string
  images?: string[]
  tags?: string[]
  visibility?: VisibilityType
  deleted?: boolean
  updated_at?: string
}

class Collection {
  // Create a new collection
  static async create(collectionData: CollectionInsert): Promise<CollectionData> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("collections").insert(collectionData).select().single()

      if (error) {
        throw new Error(`Error creating collection: ${error.message}`)
      }
      return data as CollectionData
    } catch (error) {
      console.error("Error creating collection:", error)
      throw error
    }
  }

  // Get collection by ID
  static async findById(id: string): Promise<CollectionData | null> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).eq("deleted", false).single()

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null
        }
        throw new Error(`Error getting collection: ${error.message}`)
      }

      return data as CollectionData
    } catch (error) {
      console.error("Error getting collection by ID:", error)
      throw error
    }
  }

  // Update collection
  static async update(id: string, updates: CollectionUpdate): Promise<CollectionData> {
    try {
      const supabase = await createClient()

      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("collections")
        .update(updateData)
        .eq("id", id)
        .eq("deleted", false)
        .select()
        .single()

      if (error) {
        throw new Error(`Error updating collection: ${error.message}`)
      }

      console.log("Collection updated successfully:", data)

      return data as CollectionData
    } catch (error) {
      console.error("Error updating collection:", error)
      throw error
    }
  }

  // Soft delete (mark as deleted)
  static async softDelete(id: string): Promise<CollectionData> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("collections")
        .update({
          deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error soft deleting collection: ${error.message}`)
      }

      return data as CollectionData
    } catch (error) {
      console.error("Error soft deleting collection:", error)
      throw error
    }
  }

  // Restore a soft deleted collection
  static async restore(id: string): Promise<CollectionData> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("collections")
        .update({
          deleted: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error restoring collection: ${error.message}`)
      }

      return data as CollectionData
    } catch (error) {
      console.error("Error restoring collection:", error)
      throw error
    }
  }

  // Hard delete (permanently remove from database)
  static async hardDelete(id: string): Promise<void> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from("collections").delete().eq("id", id)

      if (error) {
        throw new Error(`Error hard deleting collection: ${error.message}`)
      }
    } catch (error) {
      console.error("Error hard deleting collection:", error)
      throw error
    }
  }
}

export default Collection
