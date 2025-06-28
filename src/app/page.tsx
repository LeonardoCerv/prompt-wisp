import { createClient } from '../lib/utils/supabase/server';
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default async function App() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()


  return (
    <main className="flex flex-col min-h-screen">
      <Header user={user} />
      
        <div className="flex flex-col items-center gap-4 w-full">
          <h1 className="text-4xl sm:text-5xl font-light text-moonlight-silver-bright text-center mt-4 mb-6">
            Silver on Black
          </h1>
          <p className="text-lg wispy-text-ethereal text-center max-w-md mb-8 opacity-90 text-moonlight-silver">
            A sleek, high-contrast interface with the shimmering elegance of Moonlight Silver against deep black
          </p>
          
          {/* Call to Action */}
            <Link href="/login">
              <Button size="lg" className="wispy-text-glow">
                Login
              </Button>
            </Link>
           
        </div> 
        <Footer />
</main>
  );
}