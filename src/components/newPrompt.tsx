'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface NewPrompt {
  title: string
  description: string
  tags: string
  content: string
}

interface NewPromptPageProps {
  onSubmit: (prompt: NewPrompt) => void
  onCancel: () => void
}

export default function NewPromptPage({ onSubmit, onCancel }: NewPromptPageProps) {
  const [formData, setFormData] = useState<NewPrompt>({
    title: '',
    description: '',
    tags: '',
    content: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      onSubmit(formData)
      onCancel() // Close the dialog after successful submission
    } catch (error) {
      console.error('Error creating prompt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof NewPrompt, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = formData.title.trim() && formData.content.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-white">
          Title *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter prompt title..."
          className="bg-[var(--black)] border-[var(--moonlight-silver-dim)] text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-white">
          Description
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief description of what this prompt does..."
          className="bg-[var(--black)] border-[var(--moonlight-silver-dim)] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm font-medium text-white">
          Tags
        </Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          placeholder="coding, creative, business (comma-separated)"
          className="bg-[var(--black)] border-[var(--moonlight-silver-dim)] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium text-white">
          Prompt Content *
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Write your prompt instructions here..."
          className="min-h-[120px] bg-[var(--black)] border-[var(--moonlight-silver-dim)] text-white"
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90 text-white"
        >
          {isSubmitting ? 'Creating...' : 'Create Prompt'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[var(--moonlight-silver-dim)] text-white hover:bg-[var(--moonlight-silver-dim)]/10"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
