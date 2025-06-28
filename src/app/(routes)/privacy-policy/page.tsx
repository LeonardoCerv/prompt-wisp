import Header from "@/components/header";
import Footer from "@/components/footer";
import { createClient } from '@/lib/utils/supabase/server';


export default async function PrivacyPolicyPage() {
    const supabase = await createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
  return (
    <main className="flex flex-col min-h-screen">
      <Header user={user} />
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <h1 className="text-5xl sm:text-6xl font-light text-moonlight-silver-bright text-center mb-8 tracking-tight">
          Privacy Policy
        </h1>
        <div className="max-w-2xl w-full text-moonlight-silver text-lg sm:text-xl font-normal space-y-8 opacity-90">
          <p>
            Your privacy is important to us. This policy explains how we handle
            your information while our app is in development.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            1. Data Collection
          </h2>
          <p>
            We collect only the information necessary to provide and improve our
            service. No unnecessary data is gathered.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            2. Data Usage
          </h2>
          <p>
            Your data is used solely for operating and enhancing the app. We do
            not sell or share your information with third parties.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            3. Data Security
          </h2>
          <p>
            We take reasonable steps to protect your data, but no system is
            completely secure. We are not responsible for data leaks or
            unauthorized access resulting from attacks or vulnerabilities.
          </p>
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">
            4. Changes to This Policy
          </h2>
          <p>
            This policy may change as the app evolves. Continued use of the app
            means you accept the latest version.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
