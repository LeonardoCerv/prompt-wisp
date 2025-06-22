'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../lib/utils/supabase/server'
import LoginPage from '@/components/pages/login'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export default async function Login() {
  return (
    <LoginPage />
  );
}