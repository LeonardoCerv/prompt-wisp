import Header from "@/components/header";
import Footer from "@/components/footer";
import { createClient } from '@/lib/utils/supabase/server';

export default async function TermsOfServicePage() {
    const supabase = await createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  

  return (
    <main className="flex flex-col min-h-screen">
      <Header user={user} />
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <h1 className="text-5xl sm:text-6xl font-light text-moonlight-silver-bright text-center mb-8 tracking-tight">
          Terms of Service
        </h1>
        <div className="max-w-2xl w-full text-moonlight-silver text-lg sm:text-xl font-normal space-y-8 opacity-90">
          <p>
            Welcome to our app. By using this service, you agree to the following
            terms. Please read them carefully.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            1. Use at Your Own Risk
          </h2>
          <p>
            This app is currently in development. Features and data may change or
            be removed at any time without notice. We do not guarantee
            uninterrupted or error-free service.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            2. Data & Privacy
          </h2>
          <p>
            We strive to protect your data, but you acknowledge that no system is
            completely secure. We are not responsible for any data loss,
            unauthorized access, or data leaks that may occur due to attacks or
            vulnerabilities.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            3. No Liability
          </h2>
          <p>
            You use this app at your own risk. We are not liable for any
            damages, losses, or issues arising from your use of the service.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            4. Changes to Terms
          </h2>
          <p>
            These terms may be updated at any time. Continued use of the app
            means you accept the latest version.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
