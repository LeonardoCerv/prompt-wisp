'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Crown, 
  Brain,
  Code,
  Briefcase,
  Palette,
  MessageSquare
} from 'lucide-react'

// Mock data for marketplace prompts
const featuredPrompts = [
  {
    id: '1',
    title: 'Advanced Code Review Assistant',
    description: 'Comprehensive code analysis with security, performance, and best practices evaluation',
    price: 15,
    rating: 4.9,
    reviews: 234,
    category: 'Development',
    author: 'CodeMaster Pro',
    tags: ['Programming', 'Code Review', 'Security'],
    featured: true
  },
  {
    id: '2',
    title: 'Creative Writing Catalyst',
    description: 'Unlock your creativity with advanced storytelling and narrative development prompts',
    price: 12,
    rating: 4.8,
    reviews: 189,
    category: 'Creative',
    author: 'WriteWell Studio',
    tags: ['Writing', 'Creativity', 'Storytelling'],
    featured: true
  },
  {
    id: '3',
    title: 'Business Strategy Analyzer',
    description: 'Professional-grade business analysis and strategic planning framework',
    price: 25,
    rating: 4.9,
    reviews: 156,
    category: 'Business',
    author: 'StrategyExperts',
    tags: ['Business', 'Strategy', 'Analysis'],
    featured: true
  },
]

const categories = [
  { name: 'Development', icon: Code, count: 156, color: 'var(--wisp-blue)' },
  { name: 'Creative', icon: Palette, count: 89, color: 'var(--soft-lavender)' },
  { name: 'Business', icon: Briefcase, count: 234, color: 'var(--glow-ember)' },
  { name: 'Research', icon: Brain, count: 127, color: 'var(--ethereal-teal)' },
  { name: 'Marketing', icon: TrendingUp, count: 98, color: 'var(--flare-cyan)' },
  { name: 'Communication', icon: MessageSquare, count: 76, color: 'var(--pale-cyan)' },
]

const allPrompts = [
  ...featuredPrompts,
  {
    id: '4',
    title: 'Data Analysis Wizard',
    description: 'Transform raw data into actionable insights with advanced analytical prompts',
    price: 18,
    rating: 4.7,
    reviews: 145,
    category: 'Research',
    author: 'DataMinds',
    tags: ['Data', 'Analysis', 'Insights'],
    featured: false
  },
  {
    id: '5',
    title: 'Social Media Strategist',
    description: 'Create engaging content and strategic campaigns across all platforms',
    price: 10,
    rating: 4.6,
    reviews: 203,
    category: 'Marketing',
    author: 'SocialGuru',
    tags: ['Social Media', 'Content', 'Marketing'],
    featured: false
  },
  {
    id: '6',
    title: 'Academic Research Helper',
    description: 'Streamline your research process with systematic literature review prompts',
    price: 20,
    rating: 4.8,
    reviews: 87,
    category: 'Research',
    author: 'AcademicEdge',
    tags: ['Research', 'Academic', 'Literature'],
    featured: false
  }
]

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredPrompts, setFilteredPrompts] = useState(allPrompts)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterPrompts(term, selectedCategory)
  }

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category)
    filterPrompts(searchTerm, category)
  }

  const filterPrompts = (search: string, category: string | null) => {
    let filtered = allPrompts

    if (search) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(search.toLowerCase()) ||
        prompt.description.toLowerCase().includes(search.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (category) {
      filtered = filtered.filter(prompt => prompt.category === category)
    }

    setFilteredPrompts(filtered)
  }

  return (
    <div className="min-h-screen bg-[var(--black)] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 wispy-gradient-text">
            Prompt Marketplace
          </h1>
          <p className="text-xl text-[var(--moonlight-silver)] mb-8 max-w-2xl mx-auto">
            Discover premium, expert-crafted prompts to supercharge your AI workflows
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--moonlight-silver)] h-5 w-5" />
            <Input
              placeholder="Search prompts, categories, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-lg bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)] focus:border-[var(--glow-ember)] transition-colors"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-[var(--slate-grey)]"
                onClick={() => handleSearch('')}
              >
                ✕
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--glow-ember)]">1,200+</div>
              <div className="text-[var(--moonlight-silver)] text-sm">Premium Prompts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--wisp-blue)]">50K+</div>
              <div className="text-[var(--moonlight-silver)] text-sm">Happy Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--ethereal-teal)]">4.8</div>
              <div className="text-[var(--moonlight-silver)] text-sm">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={category.name}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.name
                      ? 'bg-[var(--slate-grey)] border-[var(--glow-ember)]'
                      : 'bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] hover:border-[var(--glow-ember)]/50'
                  }`}
                  onClick={() => handleCategoryFilter(selectedCategory === category.name ? null : category.name)}
                >
                  <CardContent className="p-4 text-center">
                    <IconComponent 
                      size={32} 
                      className="mx-auto mb-2" 
                      style={{ color: category.color }}
                    />
                    <h3 className="font-medium text-white text-sm mb-1">{category.name}</h3>
                    <p className="text-[var(--moonlight-silver)] text-xs">{category.count} prompts</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {selectedCategory && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[var(--moonlight-silver)] text-sm">Filtered by:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCategoryFilter(null)}
                className="h-8 px-3 text-xs"
              >
                {selectedCategory} ✕
              </Button>
            </div>
          )}
        </div>

        {/* Featured Prompts */}
        {!selectedCategory && !searchTerm && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="text-[var(--glow-ember)]" size={24} />
              <h2 className="text-2xl font-semibold text-white">Featured Prompts</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Prompts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {selectedCategory ? `${selectedCategory} Prompts` : 'All Prompts'}
            </h2>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[var(--moonlight-silver)]" />
              <span className="text-[var(--moonlight-silver)] text-sm">
                {filteredPrompts.length} results
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No prompts found</h3>
              <p className="text-[var(--moonlight-silver)] mb-4">
                Try adjusting your search terms or browse different categories
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory(null)
                  setFilteredPrompts(allPrompts)
                }}
                className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PromptCard({ prompt, featured = false }: { prompt: any, featured?: boolean }) {
  return (
    <Link href={`/marketplace/${prompt.id}`}>
      <Card className={`group cursor-pointer transition-all duration-200 hover:scale-105 ${
        featured 
          ? 'bg-gradient-to-br from-[var(--deep-charcoal)] to-[var(--slate-grey)] border-[var(--glow-ember)]/50' 
          : 'bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] hover:border-[var(--glow-ember)]/30'
      }`}>
        <CardContent className="p-6">
          {featured && (
            <div className="flex items-center gap-1 mb-3">
              <Crown size={14} className="text-[var(--glow-ember)]" />
              <span className="text-[var(--glow-ember)] text-xs font-medium">FEATURED</span>
            </div>
          )}
          
          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[var(--moonlight-silver-bright)] transition-colors">
            {prompt.title}
          </h3>
          
          <p className="text-[var(--moonlight-silver)] text-sm mb-4 line-clamp-2">
            {prompt.description}
          </p>
          
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-[var(--glow-ember)] fill-current" />
              <span className="text-white font-medium">{prompt.rating}</span>
              <span className="text-[var(--moonlight-silver)]">({prompt.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} className="text-[var(--moonlight-silver)]" />
              <span className="text-[var(--moonlight-silver)]">{prompt.author}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {prompt.tags.slice(0, 3).map((tag: string) => (
              <Badge 
                key={tag}
                variant="secondary"
                className="bg-[var(--slate-grey)] text-[var(--moonlight-silver)] hover:bg-[var(--slate-grey)]/80"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[var(--glow-ember)]">
              ${prompt.price}
            </div>
            <Button 
              size="sm"
              className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 gap-2"
              onClick={(e) => {
                e.preventDefault()
                // Handle add to cart functionality
              }}
            >
              <ShoppingCart size={14} />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}