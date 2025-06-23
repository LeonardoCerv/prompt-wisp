'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  ShoppingCart, 
  Users, 
  Calendar, 
  Download,
  Shield,
  Heart,
  Share2,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Mock data for individual prompt
const promptData = {
  id: '1',
  title: 'Advanced Code Review Assistant',
  description: 'Comprehensive code analysis with security, performance, and best practices evaluation. This prompt helps developers conduct thorough code reviews by analyzing security vulnerabilities, performance bottlenecks, code maintainability, and adherence to best practices.',
  longDescription: `This advanced code review assistant is designed to help development teams maintain high code quality standards. It provides comprehensive analysis across multiple dimensions:

**Security Analysis**: Identifies potential security vulnerabilities, injection risks, and authentication issues.

**Performance Evaluation**: Analyzes code efficiency, identifies bottlenecks, and suggests optimization opportunities.

**Best Practices**: Ensures adherence to coding standards, design patterns, and industry best practices.

**Maintainability**: Evaluates code readability, documentation quality, and structural organization.

The prompt is particularly effective for:
- Large codebases requiring systematic review
- Teams implementing CI/CD quality gates
- Senior developers mentoring junior team members
- Security-sensitive applications`,
  price: 15,
  rating: 4.9,
  reviews: 234,
  category: 'Development',
  author: 'CodeMaster Pro',
  authorAvatar: '👨‍💻',
  tags: ['Programming', 'Code Review', 'Security', 'Performance', 'Best Practices'],
  features: [
    'Multi-language code analysis',
    'Security vulnerability detection',
    'Performance optimization suggestions',
    'Detailed documentation generation',
    'Integration with popular IDEs',
    'Customizable review criteria'
  ],
  lastUpdated: '2024-12-15',
  downloads: 1250,
  compatibility: ['GPT-4', 'Claude', 'Gemini'],
  sampleOutput: `## Code Review Summary

**File**: authentication.js
**Overall Rating**: B+ (Good with minor improvements needed)

### Security Analysis ✅
- ✅ Password hashing implemented correctly
- ⚠️  Consider adding rate limiting for login attempts
- ✅ JWT tokens properly signed

### Performance ⚠️
- ⚠️  Database queries could be optimized (consider indexing)
- ✅ Efficient error handling

### Best Practices ✅
- ✅ Consistent naming conventions
- ✅ Proper error handling
- ⚠️  Add more inline documentation

### Recommendations
1. Implement rate limiting middleware
2. Add database indexes for user lookup
3. Enhance inline documentation for complex functions`
}

export default function MarketplaceSlugPage() {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--black)] py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/marketplace" className="flex items-center gap-2 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)] transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-[var(--wisp-blue)] text-white">
                  {promptData.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-[var(--glow-ember)] fill-current" />
                  <span className="text-white font-medium">{promptData.rating}</span>
                  <span className="text-[var(--moonlight-silver)]">({promptData.reviews} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                {promptData.title}
              </h1>
              
              <p className="text-xl text-[var(--moonlight-silver)] mb-6">
                {promptData.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-[var(--moonlight-silver)]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{promptData.authorAvatar}</span>
                  <span>by {promptData.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Updated {new Date(promptData.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={14} />
                  <span>{promptData.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <div className="text-[var(--moonlight-silver)] whitespace-pre-line leading-relaxed">
                  {promptData.longDescription}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {promptData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[var(--glow-ember)]" />
                      <span className="text-[var(--moonlight-silver)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Output */}
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Sample Output</h2>
                <div className="bg-[var(--slate-grey)] rounded-lg p-4 font-mono text-sm">
                  <pre className="text-[var(--moonlight-silver)] whitespace-pre-wrap">
                    {promptData.sampleOutput}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] sticky top-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--glow-ember)] mb-4">
                    ${promptData.price}
                  </div>
                  
                  <Button 
                    size="lg"
                    className="w-full bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 mb-3"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart 
                        size={14} 
                        className={`mr-1 ${isWishlisted ? 'fill-current text-red-500' : ''}`}
                      />
                      {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-[var(--moonlight-silver-dim)]">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-[var(--glow-ember)]" />
                      <span className="text-[var(--moonlight-silver)]">30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download size={14} className="text-[var(--glow-ember)]" />
                      <span className="text-[var(--moonlight-silver)]">Lifetime access & updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[var(--glow-ember)]" />
                      <span className="text-[var(--moonlight-silver)]">Commercial license included</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compatibility */}
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)]">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Compatible with</h3>
                <div className="space-y-2">
                  {promptData.compatibility.map((platform) => (
                    <div key={platform} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-[var(--glow-ember)]" />
                      <span className="text-[var(--moonlight-silver)]">{platform}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)]">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {promptData.tags.map((tag) => (
                    <Badge 
                      key={tag}
                      variant="secondary"
                      className="bg-[var(--slate-grey)] text-[var(--moonlight-silver)] hover:bg-[var(--slate-grey)]/80"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}