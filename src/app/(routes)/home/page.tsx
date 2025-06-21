
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/utils/supabase/server';
import HomePage from '../../../components/pages/home';

export default async function Home() {

    const supabase = await createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      redirect('/login')
    }
    else if (user) {
      return (
        <HomePage user={user} />
      )
    }
}
