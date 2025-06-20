import Image from 'next/image'
import Link from 'next/link'
import { HomeIcon, BookOpenText, Layers, Menu, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="w-full py-4 px-6 border-b border-moonlight-silver/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/wisplogo.svg"
            alt="Wisp logo"
            width={80}
            height={80}
            priority
            className="object-contain"
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <HomeIcon size={16} />
            <span>Home</span>
          </Link>
          <Link href="#features" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <Layers size={16} />
            <span>Features</span>
          </Link>
          <Link href="#docs" className="flex items-center gap-2 text-moonlight-silver hover:text-moonlight-silver-bright transition-colors">
            <BookOpenText size={16} />
            <span>Documentation</span>
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button className="gap-2 hidden sm:inline-flex" variant="default" size="default">
            <PlusCircle size={16} />
            <span>Get Started</span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}
