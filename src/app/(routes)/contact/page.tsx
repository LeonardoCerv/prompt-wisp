import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from '@/lib/utils/supabase/server';

export default async function ContactPage() {
    const supabase = await createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  

  return (
    <main className="flex flex-col min-h-screen">
      <Header user={user} />
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <h1 className="text-5xl sm:text-6xl font-light text-moonlight-silver-bright text-center mb-8 tracking-tight">
          Contact
        </h1>
        <p className="text-2xl sm:text-3xl text-moonlight-silver text-center font-normal mb-12 max-w-2xl opacity-90">
          We’d love to hear from you. Reach out anytime.
        </p>
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <Mail size={32} className="text-pale-cyan" />
            <span className="text-3xl sm:text-4xl text-moonlight-silver-bright select-all font-medium">
              leocerva29@gmail.com
            </span>
          </div>
        </div>
        <span className="block mt-12 text-lg text-moonlight-silver-dim text-center opacity-70">
          We typically respond within 1–2 business days.
        </span>
        <Link
          href="/"
          className="block mt-8 text-lg text-moonlight-silver-dim underline hover:text-pale-cyan transition text-center"
        >
          Back to Home
        </Link>
      </section>
      <Footer />
    </main>
  );
}
