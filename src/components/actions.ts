"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/server"
import Prompt, { type PromptInsert } from "@/lib/models/prompt"
import Collection, { type CollectionInsert } from "@/lib/models/collection"
import UsersPrompts from "@/lib/models/usersPrompts"
import UsersCollections from "@/lib/models/usersCollections"
import CollectionPrompts from "@/lib/models/collectionPrompts"

// Authentication helper
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function signout() {
  const supabase = await createClient()

  // type-casting here for convenience
  const { error } = await supabase.auth.signOut({ scope: "local" })

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/")
}

// Prompt Actions
export async function createPromptAction(formData: FormData) {
  try {
    const user = await getAuthenticatedUser()

    const promptData: PromptInsert = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      description: (formData.get("description") as string) || undefined,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()) : [],
      visibility: (formData.get("visibility") as "public" | "private") || "private",
      images: formData.get("images") ? JSON.parse(formData.get("images") as string) : [],
    }

    // Create the prompt
    const newPrompt = await Prompt.create(promptData)

    // Create user-prompt relationship with owner role
    await UsersPrompts.create({
      prompt_id: newPrompt.id,
      user_id: user.id,
      user_role: "owner",
      favorite: false,
    })

    revalidatePath("/")
    return { success: true, prompt: newPrompt }
  } catch (error) {
    console.error("Error creating prompt:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create prompt" }
  }
}

export async function updatePromptAction(promptId: string, formData: FormData) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user can edit this prompt
    const userRole = await UsersPrompts.getUserRole(promptId, user.id)
    if (!userRole || (userRole !== "owner" && userRole !== "collaborator")) {
      throw new Error("You don't have permission to edit this prompt")
    }

    const updates = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      description: (formData.get("description") as string) || undefined,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()) : [],
      visibility: (formData.get("visibility") as "public" | "private") || "private",
      images: formData.get("images") ? JSON.parse(formData.get("images") as string) : [],
    }

    const updatedPrompt = await Prompt.update(promptId, updates)

    revalidatePath("/")
    revalidatePath(`/prompt/${updatedPrompt.id}`)
    return { success: true, prompt: updatedPrompt }
  } catch (error) {
    console.error("Error updating prompt:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update prompt" }
  }
}

export async function deletePromptAction(promptId: string) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user owns this prompt
    const userRole = await UsersPrompts.getUserRole(promptId, user.id)
    if (userRole !== "owner") {
      throw new Error("You don't have permission to delete this prompt")
    }

    await Prompt.softDelete(promptId)

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete prompt" }
  }
}

export async function savePromptAction(promptId: string) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user already has access to this prompt
    const existingRole = await UsersPrompts.getUserRole(promptId, user.id)
    if (existingRole) {
      throw new Error("You already have access to this prompt")
    }

    // Check if prompt exists and is public
    const prompt = await Prompt.findById(promptId)
    if (!prompt) {
      throw new Error("Prompt not found")
    }

    if (prompt.visibility !== "public") {
      throw new Error("You can only save public prompts")
    }

    // Create user-prompt relationship with buyer role
    await UsersPrompts.create({
      prompt_id: promptId,
      user_id: user.id,
      user_role: "buyer",
      favorite: false,
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error saving prompt:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save prompt" }
  }
}

export async function toggleFavoritePromptAction(promptId: string) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user has access to this prompt
    const userRole = await UsersPrompts.getUserRole(promptId, user.id)
    if (!userRole) {
      throw new Error("You don't have access to this prompt")
    }

    // Toggle favorite status
    const currentFavorite = await UsersPrompts.isFavorite(user.id, promptId)
    await UsersPrompts.updateFavorite(promptId, user.id, !currentFavorite)

    revalidatePath("/")
    return { success: true, isFavorite: !currentFavorite }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle favorite" }
  }
}

export async function restorePrompt(promptId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  // Verify user owns the prompt
  const userRole = await UsersPrompts.getUserRole(promptId, user.id)
  if (userRole !== "owner") {
    throw new Error("Unauthorized")
  }

  try {
    await Prompt.restore(promptId)
    revalidatePath("/prompt")
  } catch (error) {
    throw new Error(`Failed to restore prompt: ${(error as Error).message}`)
  }
}

// Collection Actions
export async function createCollectionAction(formData: FormData) {
  try {
    const user = await getAuthenticatedUser()

    const collectionData: CollectionInsert = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()) : [],
      visibility: (formData.get("visibility") as "public" | "private") || "private",
      images: formData.get("images") ? JSON.parse(formData.get("images") as string) : [],
    }

    // Create the collection
    const newCollection = await Collection.create(collectionData)

    // Create user-collection relationship with owner role
    await UsersCollections.create({
      collection_id: newCollection.id,
      user_id: user.id,
      user_role: "owner",
      favorite: false,
    })

    revalidatePath("/")
    return { success: true, collection: newCollection }
  } catch (error) {
    console.error("Error creating collection:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create collection" }
  }
}

export async function updateCollectionAction(collectionId: string, formData: FormData) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user can edit this collection
    const userRole = await UsersCollections.getUserRole(collectionId, user.id)
    if (!userRole || (userRole !== "owner" && userRole !== "collaborator")) {
      throw new Error("You don't have permission to edit this collection")
    }

    const updates = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()) : [],
      visibility: (formData.get("visibility") as "public" | "private") || "private",
      images: formData.get("images") ? JSON.parse(formData.get("images") as string) : [],
    }

    const updatedCollection = await Collection.update(collectionId, updates)

    revalidatePath("/")
    return { success: true, collection: updatedCollection }
  } catch (error) {
    console.error("Error updating collection:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update collection" }
  }
}

export async function deleteCollectionAction(collectionId: string) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user owns this collection
    const userRole = await UsersCollections.getUserRole(collectionId, user.id)
    if (userRole !== "owner") {
      throw new Error("You don't have permission to delete this collection")
    }

    await Collection.softDelete(collectionId)

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting collection:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete collection" }
  }
}

export async function toggleFavoriteCollectionAction(collectionId: string) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user has access to this collection
    const userRole = await UsersCollections.getUserRole(collectionId, user.id)
    if (!userRole) {
      throw new Error("You don't have access to this collection")
    }

    // Toggle favorite status
    const currentFavorite = await UsersCollections.isFavorite(user.id, collectionId)
    await UsersCollections.updateFavorite(collectionId, user.id, !currentFavorite)

    revalidatePath("/")
    return { success: true, isFavorite: !currentFavorite }
  } catch (error) {
    console.error("Error toggling collection favorite:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle favorite" }
  }
}

export async function addPromptToCollectionAction(collectionId: string, promptIds: string[]) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user can edit this collection
    const userRole = await UsersCollections.getUserRole(collectionId, user.id)
    if (!userRole || (userRole !== "owner" && userRole !== "collaborator")) {
      throw new Error("You don't have permission to edit this collection")
    }

    // Add each prompt to the collection
    for (const promptId of promptIds) {
      // Check if user has access to the prompt
      const promptRole = await UsersPrompts.getUserRole(promptId, user.id)
      if (!promptRole) {
        console.warn(`User doesn't have access to prompt ${promptId}, skipping`)
        continue
      }

      // Check if prompt is already in collection
      const existingRelation = await CollectionPrompts.getPrompts(collectionId)
      if (existingRelation.includes(promptId)) {
        console.warn(`Prompt ${promptId} already in collection ${collectionId}, skipping`)
        continue
      }

      await CollectionPrompts.create({
        collection_id: collectionId,
        prompt_id: promptId,
      })
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error adding prompts to collection:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to add prompts to collection" }
  }
}

export async function removePromptFromCollectionAction(collectionId: string, promptId: string) {
  try {
    const user = await getAuthenticatedUser()

    // Check if user can edit this collection
    const userRole = await UsersCollections.getUserRole(collectionId, user.id)
    if (!userRole || (userRole !== "owner" && userRole !== "collaborator")) {
      throw new Error("You don't have permission to edit this collection")
    }

    // Remove prompt from collection
    await CollectionPrompts.delete(promptId, collectionId)

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error removing prompt from collection:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove prompt from collection" }
  }
}

// Redirect actions
export async function redirectToPrompt(slug: string) {
  redirect(`/prompt/${slug}`)
}

export async function redirectToCollection(slug: string) {
  redirect(`/collection/${slug}`)
}

export async function redirectToHome() {
  redirect("/")
}
