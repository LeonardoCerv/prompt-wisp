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
          <h2 className="text-2xl font-medium text-moonlight-silver-bright mt-8 mb-2">Privacy Policy for the Chrome Extension</h2>
          <p>
            <strong>Privacy Policy</strong>
          </p>
          <p>
            <strong>Introduction</strong>
          </p>
          <p>
            This privacy policy describes how our extension handles user data. We are committed to protecting our users&apos; privacy and ensuring their data is treated securely and responsibly.
          </p>
          <p>
            <strong>Data Collection</strong>
          </p>
          <p>
            Our extension does not collect personal or sensitive user information. This includes, but is not limited to:
          </p>
          <ul>
            <li>Personally identifiable information (name, address, email, etc.).</li>
            <li>Health information.</li>
            <li>Financial and payment information.</li>
            <li>Authentication information (passwords, PINs, etc.).</li>
            <li>Personal communications (messages, emails, etc.).</li>
            <li>Location (IP address, GPS coordinates, etc.).</li>
            <li>Web history.</li>
            <li>User activity (clicks, scrolls, etc.).</li>
            <li>Website content (texts, images, videos, etc.).</li>
          </ul>
          <p>
            <strong>Data Usage</strong>
          </p>
          <p>
            If our extension interacts with user data, it will be exclusively to fulfill the specific functionalities of the extension. Data will not be sold, transferred, or used for purposes unrelated to the extension&apos;s objective.
          </p>
          <p>
            <strong>Data Transfer</strong>
          </p>
          <p>
            We certify that:
          </p>
          <ul>
            <li>We do not sell or transfer user data to third parties, except in approved use cases.</li>
            <li>We do not use or transfer user data for purposes unrelated to the specific purpose of the extension.</li>
            <li>We do not use or transfer user data to determine creditworthiness or perform credit activities.</li>
          </ul>
          <p>
            <strong>Security</strong>
          </p>
          <p>
            We are committed to implementing appropriate security measures to protect any data that may be processed by the extension.
          </p>
          <p>
            <strong>Changes to the Privacy Policy</strong>
          </p>
          <p>
            We reserve the right to update this privacy policy at any time. Users will be notified of any significant changes.
          </p>
          <p>
            <strong>Contact</strong>
          </p>
          <p>
            If you have questions or concerns about this privacy policy, you can contact us through the channels provided in the extension&apos;s description.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
