'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PromptData } from '@/components/prompt-list-card'

// Mock data - TODO: come from supabase
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
  },
  // Public prompts (owned by user but made public)
  {
    id: '7',
    title: 'Email Writing Assistant',
    description: 'Professional email drafting for business communications',
    category: 'Communication',
    tags: ['email', 'business', 'professional'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-03',
    lastUsed: '2025-01-14',
    usage: 156,
    content: 'You are a professional communication expert. Help users write clear, concise, and effective emails for various business purposes including requests, follow-ups, proposals, and formal correspondence.'
  },
  {
    id: '8',
    title: 'Recipe Generator',
    description: 'Create delicious recipes based on available ingredients',
    category: 'Cooking',
    tags: ['cooking', 'recipes', 'food'],
    isFavorite: true,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-06',
    lastUsed: '2025-01-21',
    usage: 89,
    content: 'You are a creative chef and recipe developer. Create delicious, practical recipes based on ingredients provided by the user. Include preparation steps, cooking times, and helpful tips.'
  },
  {
    id: '9',
    title: 'Study Guide Creator',
    description: 'Transform any topic into comprehensive study materials',
    category: 'Education',
    tags: ['study', 'learning', 'education'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-09',
    lastUsed: '2025-01-13',
    usage: 203,
    content: 'You are an educational content specialist. Create comprehensive study guides, flashcards, and learning materials for any subject. Break down complex topics into digestible sections with key points and examples.'
  },
  {
    id: '10',
    title: 'Travel Planner',
    description: 'Plan detailed itineraries for any destination',
    category: 'Travel',
    tags: ['travel', 'planning', 'vacation'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-11',
    lastUsed: '2025-01-15',
    usage: 78,
    content: 'You are a travel planning expert. Create detailed itineraries including attractions, restaurants, accommodations, and local tips for any destination. Consider budget, interests, and travel style.'
  },
  {
    id: '11',
    title: 'Fitness Coach',
    description: 'Personalized workout plans and fitness guidance',
    category: 'Health',
    tags: ['fitness', 'workout', 'health'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-07',
    lastUsed: '2025-01-22',
    usage: 134,
    content: 'You are a certified fitness trainer. Create personalized workout plans, provide exercise guidance, and offer motivation to help users achieve their fitness goals safely and effectively.'
  },
  {
    id: '12',
    title: 'Language Tutor',
    description: 'Interactive language learning and practice sessions',
    category: 'Education',
    tags: ['language', 'learning', 'tutor', 'idjoewkeodkeodkeodkeokdokdeo'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-04',
    lastUsed: '2025-01-12',
    usage: 267,
    content: 'You are a multilingual language tutor. Help users learn new languages through conversation practice, grammar explanations, vocabulary building, and cultural insights.'
  },
    {
    id: '13',
    title: 'Language Tutor',
    description: 'Interactive language learning and practice sessions',
    category: 'Education',
    tags: ['language', 'learning', 'tutor', 'idjoewkeodkeodkeodkeokdokdeo'],
    isFavorite: false,
    isDeleted: false,
    isSaved: false,
    isOwner: true,
    isPublic: true,
    createdAt: '2025-01-04',
    lastUsed: '2025-01-12',
    usage: 267,
    content: 'You are a multilingual language tutor. Help users learn new languages through conversation practice, grammar explanations, vocabulary building, and cultural insights.'
  }
]

export type FilterType = 'all' | 'all-prompts' | 'favorites' | 'your-prompts' | 'saved' | 'deleted'

interface NewPrompt {
  title: string
  description: string
  category: string
  tags: string
  content: string
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptData[]>(mockPrompts)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)

  // Get all unique tags
  const allTags = Array.from(new Set(prompts.flatMap(p => p.tags)))

  const isOwner = (prompt: PromptData) => {
    // In a real app, check if user.id matches prompt.userId
    return prompt.isOwner !== false
  }

  // Filter prompts based on active filter, search, and selected tags
  const filteredPrompts = prompts.filter(prompt => {
    // Only show deleted prompts when specifically viewing deleted filter
    if (activeFilter === 'deleted') {
      return prompt.isDeleted
    }
    
    // For all other filters
    if (prompt.isDeleted) {
      return false
    }

    // Filter by type
    if (activeFilter === 'favorites' && !prompt.isFavorite) return false
    if (activeFilter === 'your-prompts' && !isOwner(prompt)) return false
    if (activeFilter === 'saved' && !prompt.isSaved) return false

    // Filter by search
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by tags
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => prompt.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  // Count prompts for each filter
  const getFilterCount = (filter: FilterType) => {
    switch (filter) {
      case 'all-prompts':
        return prompts.filter(p => !p.isDeleted).length
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

  const createNewPrompt = (newPrompt: NewPrompt) => {
    const prompt: PromptData = {
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
    toast.success('Prompt created successfully!')
  }

  const updatePrompt = (id: string, updates: Partial<PromptData>) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, ...updates } : prompt
    ))
    if (selectedPrompt?.id === id) {
      setSelectedPrompt({...selectedPrompt, ...updates})
    }
    toast.success('Prompt updated successfully!')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const selectPrompt = (prompt: PromptData | null) => {
    setSelectedPrompt(prompt)
  }

  return {
    // State
    prompts,
    filteredPrompts,
    searchTerm,
    activeFilter,
    selectedTags,
    selectedPrompt,
    allTags,
    
    // Actions
    setSearchTerm,
    setActiveFilter,
    toggleTag,
    selectPrompt,
    toggleFavorite,
    copyToClipboard,
    deletePrompt,
    restorePrompt,
    savePrompt,
    createNewPrompt,
    updatePrompt,
    
    // Helpers
    isOwner,
    getFilterCount
  }
}
