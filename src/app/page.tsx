import { createClient } from "../lib/utils/supabase/server"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Star, Users, Zap, Shield } from "lucide-react"
import GuestLoginButton from "@/components/guest-login-button"

export default async function App() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="flex flex-col min-h-screen text-moonlight-silver-bright">
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-black to-zinc-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-8 bg-zinc-900/50 text-moonlight-silver border-zinc-800">
              <Star className="w-3 h-3 mr-1" />
              Trusted by 10,000+ creators
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="block">Elevate Your</span>
              <span className="block bg-gradient-to-r from-moonlight-silver-bright to-moonlight-silver bg-clip-text text-[var(--wisp-blue)]">
                AI Workflow
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-moonlight-silver/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              The professional platform for discovering, organizing, and sharing AI prompts. Built for teams that demand
              excellence.
            </p>


            {/* Main Content 
            <div className="mb-12 flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="block">Elevate Your</span>
                <span className="block bg-gradient-to-r from-moonlight-silver-bright to-moonlight-silver bg-clip-text text-[var(--wisp-blue)]">
                AI Workflow
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-moonlight-silver/80 max-w-2xl mx-auto md:mx-0 mb-0 leading-relaxed">
                The professional platform for discovering, organizing, and sharing AI prompts. Built for teams that demand excellence.
              </p>
              </div>
              <div className="flex-shrink-0 flex justify-center md:justify-end">
              <Image
                src="/wisp.svg"
                alt="Wisp logo"
                width={140}
                height={140}
                priority
                className="object-contain"
              />
              </div>
            </div>
            */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-moonlight-silver-bright text-[var(--wisp-blue)] hover:bg-moonlight-silver text-lg px-8 py-6"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/prompt">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 text-moonlight-silver hover:bg-zinc-900 text-lg px-8 py-6 bg-transparent"
                >
                  View Demo
                </Button>
              </Link>
              <GuestLoginButton />
            </div>

            {/* Product Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900/20 backdrop-blur-sm">
                <Image
                  src="/preview.png"
                  alt="Wisp Dashboard Preview"
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Everything you need to succeed</h2>
            <p className="text-xl text-moonlight-silver/70 max-w-2xl mx-auto">
              Professional-grade tools designed for modern AI workflows
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-zinc-800 transition-colors">
                <Zap className="w-6 h-6 text-moonlight-silver-bright" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-moonlight-silver/70 leading-relaxed">
                Find any prompt instantly with our advanced search and intelligent categorization system.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-zinc-800 transition-colors">
                <Users className="w-6 h-6 text-moonlight-silver-bright" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Team Collaboration</h3>
              <p className="text-moonlight-silver/70 leading-relaxed">
                Share prompts securely with your team. Real-time collaboration with enterprise-grade permissions.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-zinc-800 transition-colors">
                <Shield className="w-6 h-6 text-moonlight-silver-bright" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Enterprise Security</h3>
              <p className="text-moonlight-silver/70 leading-relaxed">
                Bank-level security with SOC 2 compliance. Your intellectual property stays protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by industry leaders</h2>
            <p className="text-moonlight-silver/70">
              Join thousands of professionals who&apos;ve transformed their AI workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-black/40 border border-zinc-800/50">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-moonlight-silver/90 mb-6 leading-relaxed">
                &quot;Wisp has revolutionized how our team approaches AI. The collaboration features are game-changing.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-zinc-800 rounded-full mr-3" />
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-moonlight-silver/60">Head of AI, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-black/40 border border-zinc-800/50">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-moonlight-silver/90 mb-6 leading-relaxed">
                &quot;The most intuitive prompt management platform I&apos;ve used. Clean, fast, and powerful.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-zinc-800 rounded-full mr-3" />
                <div>
                  <p className="font-semibold">Marcus Rodriguez</p>
                  <p className="text-sm text-moonlight-silver/60">Creative Director, Agency</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-black/40 border border-zinc-800/50">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-moonlight-silver/90 mb-6 leading-relaxed">
                &quot;Finally, a professional solution for prompt management. The security features give us peace of mind.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-zinc-800 rounded-full mr-3" />
                <div>
                  <p className="font-semibold">Emily Watson</p>
                  <p className="text-sm text-moonlight-silver/60">CTO, StartupXYZ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Process */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Get started in minutes</h2>
            <p className="text-xl text-moonlight-silver/70">Simple setup, powerful results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-moonlight-silver-bright">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up</h3>
              <p className="text-moonlight-silver/70">Create your account in seconds. No credit card required.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-moonlight-silver-bright">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Import & Organize</h3>
              <p className="text-moonlight-silver/70">Upload your prompts or browse our curated marketplace.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-moonlight-silver-bright">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Collaborate</h3>
              <p className="text-moonlight-silver/70">Share with your team and start building amazing AI workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">10K+</div>
              <div className="text-zinc-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
              <div className="text-zinc-400">Prompts Shared</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">99.9%</div>
              <div className="text-zinc-400">Uptime</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
              <div className="text-zinc-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-zinc-950 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to transform your AI workflow?</h2>
          <p className="text-xl text-moonlight-silver/70 mb-12">Join thousands of professionals already using Wisp</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-moonlight-silver-bright text-[var(--wisp-blue)] hover:bg-moonlight-silver text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-zinc-700 text-moonlight-silver hover:bg-zinc-900 text-lg px-8 py-6 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <GuestLoginButton />
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-moonlight-silver/60">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
