
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/utils/supabase/server';
import UserPage from '../../../components/pages/user/user';

export default async function User() {

    const supabase = await createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      redirect('/login')
    }
    else if (user) {
      return (
        <UserPage user={user} />
      )
    }
}
