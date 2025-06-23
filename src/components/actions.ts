'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../lib/utils/supabase/server';


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

// Prompt-related server actions (placeholder for future use)
export async function createPrompt(formData: FormData) {
  // TODO: Implement with Supabase when database is set up
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const tags = formData.get('tags') as string
  const content = formData.get('content') as string
  
  // Example implementation:
  // const { data, error } = await supabase
  //   .from('prompts')
  //   .insert({
  //     title,
  //     description,
  //     category,
  //     tags: tags.split(',').map(tag => tag.trim()),
  //     content,
  //     user_id: user.id
  //   })
  
  // if (error) {
  //   throw new Error('Failed to create prompt')
  // }
  
  revalidatePath('/prompt')
}

export async function updatePrompt(id: string, formData: FormData) {
  // TODO: Implement with Supabase when database is set up
  const supabase = await createClient()
  
  // Example implementation:
  // const { error } = await supabase
  //   .from('prompts')
  //   .update({
  //     title: formData.get('title') as string,
  //     description: formData.get('description') as string,
  //     category: formData.get('category') as string,
  //     tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
  //     content: formData.get('content') as string,
  //   })
  //   .eq('id', id)
  
  revalidatePath('/prompt')
}

export async function deletePrompt(id: string) {
  // TODO: Implement with Supabase when database is set up
  const supabase = await createClient()
  
  // Example implementation:
  // const { error } = await supabase
  //   .from('prompts')
  //   .update({ is_deleted: true })
  //   .eq('id', id)
  
  revalidatePath('/prompt')
}

export async function toggleFavoritePrompt(id: string, isFavorite: boolean) {
  // TODO: Implement with Supabase when database is set up
  const supabase = await createClient()
  
  // Example implementation:
  // const { error } = await supabase
  //   .from('user_prompt_favorites')
  //   .upsert({
  //     prompt_id: id,
  //     user_id: user.id,
  //     is_favorite: isFavorite
  //   })
  
  revalidatePath('/prompt')
}