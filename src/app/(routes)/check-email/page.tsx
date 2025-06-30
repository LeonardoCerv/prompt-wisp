import Header from "@/components/header";
import Footer from "@/components/footer";
import { createClient } from '@/lib/utils/supabase/server';

export default async function CheckEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col min-h-screen">
      <Header user={user} />
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <h1 className="text-5xl sm:text-6xl font-light text-moonlight-silver-bright text-center mb-8 tracking-tight">
          Check Your Email
        </h1>
        <div className="max-w-2xl w-full text-moonlight-silver text-lg sm:text-xl font-normal space-y-8 opacity-90 text-center">
          <p>
            We&apos;ve sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          <p>
            Didn&apos;t receive the email? Be sure to check your spam or junk folder. If you still can&apos;t find it, you can request another confirmation email from the login page.
          </p>
          <p>
            Once you&apos;ve confirmed your email, you&apos;ll be able to access all features of your account.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
