'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../lib/utils/supabase/server';
import Prompt, { PromptInsert, PromptUpdate } from '@/lib/models/prompt';

export async function signout() {
  const supabase = await createClient()

  // type-casting here for convenience
  const { error } = await supabase.auth.signOut({ scope: 'local' })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// Prompt-related server actions
export async function createPrompt(formData: FormData) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tags = formData.get('tags') as string
  const content = formData.get('content') as string
  const visibility = formData.get('visibility') as 'public' | 'private' | 'unlisted'
  
  if (!title || !content) {
    throw new Error('Title and content are required')
  }
  
  const promptData: PromptInsert = {
    title,
    description: description || null,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    content,
    visibility: visibility || 'private',
    user_id: user.id
  }
  
  try {
    const newPrompt = await Prompt.create(promptData)
    revalidatePath('/prompt')
    return newPrompt
  } catch (error) {
    throw new Error(`Failed to create prompt: ${(error as Error).message}`)
  }
}

export async function updatePrompt(id: string, formData: FormData) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  // Verify user owns the prompt
  const existingPrompt = await Prompt.findById(id)
  if (!existingPrompt || existingPrompt.user_id !== user.id) {
    throw new Error('Unauthorized')
  }
  
  const updateData: PromptUpdate = {}
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tags = formData.get('tags') as string
  const content = formData.get('content') as string
  const visibility = formData.get('visibility') as 'public' | 'private' | 'unlisted'
  
  if (title) updateData.title = title
  if (description !== undefined) updateData.description = description || null
  if (content) updateData.content = content
  if (tags !== undefined) updateData.tags = tags ? tags.split(',').map(tag => tag.trim()) : []
  if (visibility) updateData.visibility = visibility
  
  try {
    const updatedPrompt = await Prompt.update(id, updateData)
    revalidatePath('/prompt')
    return updatedPrompt
  } catch (error) {
    throw new Error(`Failed to update prompt: ${(error as Error).message}`)
  }
}

export async function deletePrompt(id: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  // Verify user owns the prompt
  const existingPrompt = await Prompt.findById(id)
  if (!existingPrompt || existingPrompt.user_id !== user.id) {
    throw new Error('Unauthorized')
  }
  
  try {
    await Prompt.softDelete(id)
    revalidatePath('/prompt')
  } catch (error) {
    throw new Error(`Failed to delete prompt: ${(error as Error).message}`)
  }
}

export async function toggleFavoritePrompt(id: string, isFavorite: boolean) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  try {
    // Get current user favorites
    const { data: userData } = await supabase
      .from('users')
      .select('favorites')
      .eq('id', user.id)
      .single()
    
    const currentFavorites = userData?.favorites || []
    let newFavorites: string[]
    
    if (isFavorite) {
      // Add to favorites if not already there
      newFavorites = currentFavorites.includes(id) 
        ? currentFavorites 
        : [...currentFavorites, id]
    } else {
      // Remove from favorites
      newFavorites = currentFavorites.filter((fav: string) => fav !== id)
    }
    
    // Update user favorites
    await supabase
      .from('users')
      .update({ favorites: newFavorites })
      .eq('id', user.id)
    
    revalidatePath('/prompt')
  } catch (error) {
    throw new Error(`Failed to toggle favorite: ${(error as Error).message}`)
  }
}