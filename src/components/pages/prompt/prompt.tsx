'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  PlusCircle, 
  Search, 
  Star, 
  BookOpen,
  Calendar, 
  Eye, 
  Copy,
  X,
  Check,
  Trash2,
  Edit,
  Archive,
  RotateCcw,
  Save,
  Home,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { type User } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Mock data for prompts - In a real app, this would come from your Supabase database
interface PromptData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  isFavorite: boolean
  isDeleted: boolean
  isSaved: boolean
  isOwner: boolean
  createdAt: string
  lastUsed: string
  usage: number
  content: string
}

const mockPrompts: PromptData[] = [
  {
    id: '1',
    title: 'Creative Writing Assistant',
    description: 'A comprehensive prompt for generating creative stories, poems, and narrative content',
    category: 'Writing',
    tags: ['creative', 'storytelling', 'content'],
    isFavorite: true,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    createdAt: '2025-01-15',
    lastUsed: '2025-01-20',
    usage: 45,
    content: 'You are a creative writing assistant skilled in crafting compelling narratives, developing characters, and creating engaging storylines. Help users write stories, poems, scripts, and other creative content with vivid descriptions and emotional depth.'
  },
  {
    id: '2',
    title: 'Code Review Helper',
    description: 'Expert code reviewer that provides constructive feedback and suggestions',
    category: 'Development',
    tags: ['coding', 'review', 'debugging'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    createdAt: '2025-01-10',
    lastUsed: '2025-01-18',
    usage: 23,
    content: 'You are an experienced software engineer and code reviewer. Analyze the provided code for best practices, potential bugs, performance issues, and suggest improvements. Provide constructive feedback with explanations.'
  },
  {
    id: '3',
    title: 'Marketing Copy Generator',
    description: 'Creates compelling marketing copy for various platforms and audiences',
    category: 'Marketing',
    tags: ['marketing', 'copywriting', 'sales'],
    isFavorite: true,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    createdAt: '2025-01-08',
    lastUsed: '2025-01-19',
    usage: 67,
    content: 'You are a skilled marketing copywriter who creates compelling, persuasive content that drives action. Generate engaging copy for ads, emails, landing pages, and social media that resonates with target audiences.'
  },
  {
    id: '4',
    title: 'Data Analysis Guide',
    description: 'Step-by-step guidance for analyzing datasets and interpreting results',
    category: 'Analytics',
    tags: ['data', 'analysis', 'statistics'],
    isFavorite: false,
    isDeleted: false,
    isSaved: true,
    isOwner: false,
    createdAt: '2025-01-05',
    lastUsed: '2025-01-16',
    usage: 12,
    content: 'You are a data analyst expert. Guide users through analyzing datasets, interpreting statistical results, creating visualizations, and drawing meaningful insights from data.'
  },
  {
    id: '5',
    title: 'Social Media Content Planner',
    description: 'Plan and create engaging social media content across different platforms',
    category: 'Marketing',
    tags: ['social-media', 'content', 'planning'],
    isFavorite: false,
    isDeleted: false,
    isSaved: true,
    isOwner: false,
    createdAt: '2025-01-12',
    lastUsed: '2025-01-17',
    usage: 34,
    content: 'Create a comprehensive social media content plan that includes engaging posts, optimal posting times, hashtag strategies, and audience engagement tactics tailored to each platform.'
  },
  {
    id: '6',
    title: 'Deleted Example Prompt',
    description: 'This is an example of a deleted prompt that can be restored',
    category: 'Example',
    tags: ['example', 'deleted'],
    isFavorite: false,
    isDeleted: true,
    isSaved: false,
    isOwner: true,
    createdAt: '2025-01-01',
    lastUsed: '2025-01-02',
    usage: 5,
    content: 'This prompt was deleted but can be recovered from the trash.'
  }
]

type FilterType = 'all' | 'favorites' | 'your-prompts' | 'saved' | 'deleted'

interface PromptPageProps {
  user: User
}

export default function PromptPage({ user }: PromptPageProps) {
  const [prompts, setPrompts] = useState(mockPrompts)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    content: ''
  })

  // Get all unique tags
  const allTags = Array.from(new Set(prompts.flatMap(p => p.tags)))

  const isOwner = (prompt: PromptData) => {
    // In a real app, check if user.id matches prompt.userId
    // For now, we'll use a mock property
    return prompt.isOwner !== false
  }

  // Filter prompts based on active filter, search, and selected tags
  const filteredPrompts = prompts.filter(prompt => {
    // Filter by type
    if (activeFilter === 'favorites' && !prompt.isFavorite) return false
    if (activeFilter === 'your-prompts' && !isOwner(prompt)) return false
    if (activeFilter === 'saved' && !prompt.isSaved) return false
    if (activeFilter === 'deleted' && !prompt.isDeleted) return false
    if (activeFilter === 'all' && prompt.isDeleted) return false

    // Filter by search
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by tags
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => prompt.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleFavorite = (id: string) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, isFavorite: !prompt.isFavorite } : prompt
    ))
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({...selectedPrompt, isFavorite: !selectedPrompt.isFavorite})
    }
  }

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success(`"${title}" copied to clipboard!`)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const deletePrompt = (id: string) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, isDeleted: true } : prompt
    ))
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null)
    }
    toast.success('Prompt moved to trash')
  }

  const restorePrompt = (id: string) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, isDeleted: false } : prompt
    ))
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({...selectedPrompt, isDeleted: false})
    }
    toast.success('Prompt restored')
  }

  const savePrompt = (id: string) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, isSaved: !prompt.isSaved } : prompt
    ))
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({...selectedPrompt, isSaved: !selectedPrompt.isSaved})
    }
    toast.success(selectedPrompt?.isSaved ? 'Prompt unsaved' : 'Prompt saved')
  }

  const createNewPrompt = () => {
    if (!newPrompt.title || !newPrompt.content) {
      toast.error('Please fill in title and content')
      return
    }

    const prompt = {
      id: Date.now().toString(),
      title: newPrompt.title,
      description: newPrompt.description,
      category: newPrompt.category || 'General',
      tags: newPrompt.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isFavorite: false,
      isDeleted: false,
      isSaved: false,
      isOwner: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: new Date().toISOString().split('T')[0],
      usage: 0,
      content: newPrompt.content
    }

    setPrompts([prompt, ...prompts])
    setNewPrompt({ title: '', description: '', category: '', tags: '', content: '' })
    setShowCreateForm(false)
    toast.success('Prompt created successfully!')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const selectPrompt = (prompt: PromptData) => {
    setSelectedPrompt(prompt)
  }

  // Count prompts for each filter
  const getFilterCount = (filter: FilterType) => {
    switch (filter) {
      case 'favorites':
        return prompts.filter(p => p.isFavorite && !p.isDeleted).length
      case 'your-prompts':
        return prompts.filter(p => isOwner(p) && !p.isDeleted).length
      case 'saved':
        return prompts.filter(p => p.isSaved && !p.isDeleted).length
      case 'deleted':
        return prompts.filter(p => p.isDeleted).length
      default:
        return prompts.filter(p => !p.isDeleted).length
    }
  }

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-full">
        {/* Create New Prompt Form */}
        {showCreateForm && (
          <div className="px-6 py-4">
            <Card className="mb-8 bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Create New Prompt</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCreateForm(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter prompt title..."
                    value={newPrompt.title}
                    onChange={(e) => setNewPrompt({...newPrompt, title: e.target.value})}
                    className="bg-[var(--slate-grey)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)]"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-slate-300">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g. Writing, Development, Marketing..."
                    value={newPrompt.category}
                    onChange={(e) => setNewPrompt({...newPrompt, category: e.target.value})}
                    className="bg-[var(--slate-grey)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of what this prompt does..."
                  value={newPrompt.description}
                  onChange={(e) => setNewPrompt({...newPrompt, description: e.target.value})}
                  className="bg-[var(--slate-grey)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)]"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-slate-300">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. creative, writing, marketing..."
                  value={newPrompt.tags}
                  onChange={(e) => setNewPrompt({...newPrompt, tags: e.target.value})}
                  className="bg-[var(--slate-grey)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)]"
                />
              </div>
              <div>
                <Label htmlFor="content" className="text-slate-300">Prompt Content</Label>
                <textarea
                  id="content"
                  placeholder="Enter your prompt content here..."
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                  className="w-full h-32 p-3 rounded-md bg-[var(--slate-grey)] border border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--glow-ember)]"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={createNewPrompt} 
                  className="gap-2 bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                >
                  <Check size={16} />
                  Create Prompt
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-5 gap-0">
          {/* Left Column - Filters */}
          <div className="col-span-5 lg:col-span-1">
            <div className="bg-[var(--black)] h-full min-h-screen pl-6 pr-4 py-6 border-r border-[var(--moonlight-silver-dim)]/30 overflow-y-auto">
              <div className="space-y-6">
                
                {/* Quick Access Section */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-medium text-[#7a77ba] uppercase tracking-wider mb-3">Quick Access</h3>
                  
                  {/* Search */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-[var(--moonlight-silver-bright)] rounded-lg py-2 px-3"
                    onClick={() => searchInputRef?.focus()}
                  >
                    <Search size={16} />
                    Search
                  </Button>

                  {/* Home */}
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                      activeFilter === 'all' 
                        ? 'bg-[#7a77ba] text-white shadow-sm' 
                        : 'text-[var(--moonlight-silver-bright)]'
                    }`}
                    onClick={() => setActiveFilter('all')}
                  >
                    <Home size={16} />
                    Home
                    <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded">
                      {getFilterCount('all')}
                    </span>
                  </Button>
                </div>

                {/* Collections Section */}
                <div className="space-y-2">
                  <h3 
                    className="text-[10px] font-medium text-[#7a77ba] uppercase tracking-wider mb-3 cursor-pointer hover:text-[#8b89c7] transition-colors flex items-center justify-between"
                    onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                  >
                    Collections
                    {collectionsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </h3>
                  
                  {collectionsExpanded && (
                    <div className="ml-6 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-[var(--moonlight-silver)] rounded-lg py-1.5 px-3"
                      >
                        My Collection 1
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-[var(--moonlight-silver)] rounded-lg py-1.5 px-3"
                      >
                        Marketing Templates
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-[var(--moonlight-silver)] rounded-lg py-1.5 px-3"
                      >
                        Development Helpers
                      </Button>
                    </div>
                  )}
                </div>

                {/* Library Section */}
                <div className="space-y-2">
                  <h3 
                    className="text-[10px] font-medium text-[#7a77ba] uppercase tracking-wider mb-3 cursor-pointer hover:text-[#8b89c7] transition-colors flex items-center justify-between"
                    onClick={() => setLibraryExpanded(!libraryExpanded)}
                  >
                    Library
                    {libraryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </h3>
                  
                  {libraryExpanded && (
                    <div className="ml-6 space-y-1">
                      <Button
                        variant={activeFilter === 'your-prompts' ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                          activeFilter === 'your-prompts' 
                            ? 'bg-[#7a77ba] text-white shadow-sm' 
                            : 'text-[var(--moonlight-silver-bright)]'
                        }`}
                        onClick={() => setActiveFilter('your-prompts')}
                      >
                        <Edit size={16} />
                        Your Prompts
                        <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded">
                          {getFilterCount('your-prompts')}
                        </span>
                      </Button>
                      
                      <Button
                        variant={activeFilter === 'favorites' ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                          activeFilter === 'favorites' 
                            ? 'bg-[#7a77ba] text-white shadow-sm' 
                            : 'text-[var(--moonlight-silver-bright)]'
                        }`}
                        onClick={() => setActiveFilter('favorites')}
                      >
                        <Star size={16} />
                        Favorites
                        <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded">
                          {getFilterCount('favorites')}
                        </span>
                      </Button>
                      
                      <Button
                        variant={activeFilter === 'saved' ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                          activeFilter === 'saved' 
                            ? 'bg-[#7a77ba] text-white shadow-sm' 
                            : 'text-[var(--moonlight-silver-bright)]'
                        }`}
                        onClick={() => setActiveFilter('saved')}
                      >
                        <Archive size={16} />
                        Saved
                        <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded">
                          {getFilterCount('saved')}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div className="space-y-2">
                  <h3 
                    className="text-[10px] font-medium text-[#7a77ba] uppercase tracking-wider mb-3 cursor-pointer hover:text-[#8b89c7] transition-colors flex items-center justify-between"
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                  >
                    Tags
                    {tagsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </h3>
                  
                  {tagsExpanded && (
                    <div className="ml-6 space-y-1 max-h-48 overflow-y-auto">
                      {allTags.map((tag) => (
                        <Button
                          key={tag}
                          variant="ghost"
                          className={`w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                            selectedTags.includes(tag)
                              ? 'bg-[#7a77ba]/20 text-[#7a77ba]'
                              : 'text-[var(--moonlight-silver)]'
                          }`}
                          onClick={() => toggleTag(tag)}
                        >
                          #{tag}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Section */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-medium text-[#7a77ba] uppercase tracking-wider mb-3">Other</h3>
                  
                  {/* Recently Deleted */}
                  <Button
                    variant={activeFilter === 'deleted' ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                      activeFilter === 'deleted' 
                        ? 'bg-[#7a77ba] text-white shadow-sm' 
                        : 'text-[var(--moonlight-silver-bright)]'
                    }`}
                    onClick={() => setActiveFilter('deleted')}
                  >
                    <Trash2 size={16} />
                    Recently Deleted
                    <span className="ml-auto text-xs bg-[var(--slate-grey)]/60 px-2 py-1 rounded">
                      {getFilterCount('deleted')}
                    </span>
                  </Button>
                </div>

              </div>
            </div>
          </div>

          {/* Center Column - Prompt List */}
          <div className={`col-span-5 ${activeFilter === 'all' ? 'lg:col-span-4' : 'lg:col-span-2'} pl-6`}>
            <div className="space-y-4">
              {activeFilter === 'all' ? (
                // Home Dashboard View
                <div className="space-y-6">
                  {/* Welcome Message & Search */}
                  <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-lg">
                    <CardContent className="py-8 text-center">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome back, {user.user_metadata?.username || user.email?.split('@')[0] || 'Leo'}!
                      </h2>
                      <p className="text-[var(--moonlight-silver)] text-lg mb-6">
                        Manage and organize your AI prompts
                      </p>
                      
                      {/* Search Bar */}
                      <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          ref={(el) => setSearchInputRef(el)}
                          placeholder="Search all prompts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-[var(--slate-grey)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)]"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recently Viewed */}
                  <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Clock size={20} />
                        Recently Viewed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {prompts
                          .filter(p => !p.isDeleted)
                          .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                          .slice(0, 3)
                          .map((prompt) => (
                            <div
                              key={prompt.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-[var(--slate-grey)] hover:bg-[var(--slate-grey)]/80 cursor-pointer transition-colors"
                              onClick={() => selectPrompt(prompt)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-[var(--moonlight-silver-bright)] font-medium text-sm">
                                    {prompt.title}
                                  </h4>
                                  {prompt.isFavorite && (
                                    <Star className="h-3 w-3 text-[var(--glow-ember)] fill-current" />
                                  )}
                                </div>
                                <p className="text-[var(--moonlight-silver)] text-xs line-clamp-1">
                                  {prompt.description}
                                </p>
                              </div>
                              <div className="text-xs text-[var(--moonlight-silver-dim)] ml-4">
                                {new Date(prompt.lastUsed).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : filteredPrompts.length === 0 ? (
                <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-12">
                  <CardContent>
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No prompts found</h3>
                    <p className="text-slate-400 mb-4">
                      {searchTerm || selectedTags.length > 0 
                        ? 'Try adjusting your search or filters' 
                        : 'Create your first prompt to get started'
                      }
                    </p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Create New Prompt
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPrompts.map((prompt) => (
                  <PromptListCard 
                    key={prompt.id} 
                    prompt={prompt} 
                    isSelected={selectedPrompt?.id === prompt.id}
                    onSelect={() => selectPrompt(prompt)}
                    onToggleFavorite={toggleFavorite}
                    onCopy={copyToClipboard}
                    onDelete={deletePrompt}
                    onRestore={restorePrompt}
                    onSave={savePrompt}
                    isOwner={isOwner(prompt)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Column - Prompt Preview */}
          {activeFilter !== 'all' && (
            <div className="col-span-5 lg:col-span-2 pl-6">
              <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-lg sticky top-4">
              {selectedPrompt ? (
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">
                          {selectedPrompt.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs bg-[var(--glow-ember)]/20 text-[var(--glow-ember)] px-2 py-1 rounded-full font-medium">
                            {selectedPrompt.category}
                          </span>
                          {selectedPrompt.isFavorite && (
                            <Star className="h-4 w-4 text-[var(--glow-ember)] fill-current" />
                          )}
                        </div>
                        <CardDescription className="text-[var(--moonlight-silver)]">
                          {selectedPrompt.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Prompt Content */}
                    <div>
                      <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)] mb-2">
                        Prompt Content
                      </h4>
                      <div className="bg-[var(--slate-grey)] p-4 rounded-lg border border-[var(--moonlight-silver-dim)]">
                        <p className="text-[var(--moonlight-silver-bright)] text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedPrompt.content}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedPrompt.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)] mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPrompt.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs bg-[var(--glow-ember)]/20 text-[var(--glow-ember)] px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div>
                      <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)] mb-2">
                        Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                          <Eye size={14} />
                          {selectedPrompt.usage} uses
                        </div>
                        <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                          <Calendar size={14} />
                          {new Date(selectedPrompt.lastUsed).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)]">
                        Actions
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedPrompt.content, selectedPrompt.title)}
                          className="gap-1 bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                        >
                          <Copy size={14} />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(selectedPrompt.id)}
                          className={`gap-1 border-[var(--moonlight-silver-dim)] ${
                            selectedPrompt.isFavorite 
                              ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                              : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
                          }`}
                        >
                          <Star size={14} className={selectedPrompt.isFavorite ? 'fill-current' : ''} />
                          {selectedPrompt.isFavorite ? 'Favorited' : 'Favorite'}
                        </Button>
                      </div>

                      {!isOwner(selectedPrompt) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => savePrompt(selectedPrompt.id)}
                          className={`w-full gap-1 border-[var(--moonlight-silver-dim)] ${
                            selectedPrompt.isSaved 
                              ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                              : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
                          }`}
                        >
                          <Save size={14} />
                          {selectedPrompt.isSaved ? 'Saved' : 'Save Prompt'}
                        </Button>
                      )}

                      {isOwner(selectedPrompt) && (
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/prompt/${selectedPrompt.id}`}>
                            <Button size="sm" variant="outline" className="w-full gap-1 border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]">
                              <Edit size={14} />
                              Edit
                            </Button>
                          </Link>
                          {selectedPrompt.isDeleted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restorePrompt(selectedPrompt.id)}
                              className="gap-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
                            >
                              <RotateCcw size={14} />
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePrompt(selectedPrompt.id)}
                              className="gap-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="text-center py-12">
                  <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Select a prompt</h3>
                  <p className="text-slate-400">
                    Choose a prompt from the list to preview its content and access options
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

// PromptListCard component for the center column
function PromptListCard({ 
  prompt, 
  isSelected,
  onSelect,
  onToggleFavorite, 
  onCopy,
  onDelete,
  onRestore,
  onSave,
  isOwner
}: { 
  prompt: PromptData, 
  isSelected: boolean,
  onSelect: () => void,
  onToggleFavorite: (id: string) => void,
  onCopy: (content: string, title: string) => void,
  onDelete: (id: string) => void,
  onRestore: (id: string) => void,
  onSave: (id: string) => void,
  isOwner: boolean
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-[var(--deep-charcoal)] border-[var(--glow-ember)]/50 shadow-lg shadow-[var(--glow-ember)]/10' 
          : 'bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] hover:border-[var(--dusky-purple)]/30 hover:shadow-lg hover:shadow-[var(--glow-ember)]/5'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg text-[var(--moonlight-silver-bright)] truncate">
                {prompt.title}
              </CardTitle>
              {prompt.isFavorite && (
                <Star className="h-4 w-4 text-[var(--glow-ember)] fill-current flex-shrink-0" />
              )}
              {prompt.isSaved && !isOwner && (
                <Archive className="h-4 w-4 text-blue-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-[var(--glow-ember)]/20 text-[var(--glow-ember)] px-2 py-1 rounded-full font-medium">
                {prompt.category}
              </span>
              {prompt.isDeleted && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-medium">
                  Deleted
                </span>
              )}
            </div>
            <CardDescription className="text-[var(--moonlight-silver)] line-clamp-2 mb-3">
              {prompt.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-[var(--moonlight-silver-dim)] mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {prompt.usage} uses
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(prompt.lastUsed).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-[var(--slate-grey)] text-[var(--moonlight-silver)] px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-xs text-[var(--moonlight-silver-dim)]">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCopy(prompt.content, prompt.title)
            }}
            className="gap-1 bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90 text-xs"
          >
            <Copy size={12} />
            Copy
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(prompt.id)
            }}
            className={`gap-1 text-xs border-[var(--moonlight-silver-dim)] ${
              prompt.isFavorite 
                ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
            }`}
          >
            <Star size={12} className={prompt.isFavorite ? 'fill-current' : ''} />
            {prompt.isFavorite ? 'Favorited' : 'Favorite'}
          </Button>

          {prompt.isDeleted && isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onRestore(prompt.id)
              }}
              className="gap-1 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <RotateCcw size={12} />
              Restore
            </Button>
          )}

          {!prompt.isDeleted && !isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onSave(prompt.id)
              }}
              className={`gap-1 text-xs border-[var(--moonlight-silver-dim)] ${
                prompt.isSaved 
                  ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                  : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
              }`}
            >
              <Save size={12} />
              {prompt.isSaved ? 'Saved' : 'Save'}
            </Button>
          )}

          {!prompt.isDeleted && isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(prompt.id)
              }}
              className="gap-1 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={12} />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
