import Header from "@/components/header";
import Footer from "@/components/footer";
import { createClient } from '@/lib/utils/supabase/server';

export default async function ErrorPage() {
    const supabase = await createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  

  return (
    <main className="flex flex-col min-h-screen">
      <Header user={user} />
      <p>Sorry, something went wrong</p>
      <Footer />
      </main>
  );
}