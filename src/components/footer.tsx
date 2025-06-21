import { ExternalLink, GraduationCap, Code } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-moonlight-silver/10 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-4 flex-row">
            <Link href="/" className="flex items-center gap-4 p-4">
              <Image 
              src="/wisplogo.svg"
              alt="Wisp logo"
              width={80}
              height={80}
              priority
              className="object-contain"
              />
            </Link>
             <Link
                href="https://github.com/your-username/prompt-wisp"
                className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </Link>
              <Link 
                href="https://twitter.com/your-handle" 
                className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </Link>
              </div>
            <p className="text-sm text-moonlight-silver mb-4 max-w-xs">
              A management tool for your AI prompts with an elegant moonlight-themed interface.
            </p>
          </div>
          
          <div>
            <h3 className="text-moonlight-silver-bright font-medium mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors inline-flex items-center gap-1.5">
                  <Code size={14} />
                  <span>Documentation</span>
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors inline-flex items-center gap-1.5">
                  <GraduationCap size={14} />
                  <span>Guides</span>
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors inline-flex items-center gap-1.5">
                  <ExternalLink size={14} />
                  <span>Examples</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-moonlight-silver-bright font-medium mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-moonlight-silver/10 mt-8 pt-6 text-center text-xs text-moonlight-silver/70">
          © {new Date().getFullYear()} Prompt Wisp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
