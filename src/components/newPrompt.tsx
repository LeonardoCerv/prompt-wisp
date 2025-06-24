'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Sparkles, 
  Star, 
  Zap, 
  Wand2, 
  Camera, 
  Users, 
  FolderOpen,
  Lock,
  Link,
  Globe,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  Save
} from 'lucide-react'

interface NewPrompt {
  title: string
  description: string
  tags: string
  content: string
  visibility: 'public' | 'private' | 'unlisted'
  images: string[]
  collaborators: string[]
  collections: string[]
}

interface NewPromptPageProps {
  onSubmit: (prompt: NewPrompt) => Promise<void>
  onCancel: () => void
} 

export default function NewPromptPage({ onSubmit, onCancel }: NewPromptPageProps) {
  const [formData, setFormData] = useState<NewPrompt>({
    title: '',
    description: '',
    tags: '',
    content: '',
    visibility: 'private',
    images: [],
    collaborators: [],
    collections: []
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { id: 1, title: 'Essentials', icon: Star, required: true },
    { id: 2, title: 'Details', icon: Zap, required: false },
    { id: 3, title: 'Advanced', icon: Wand2, required: false },
    { id: 4, title: 'Ready', icon: Check, required: false }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error creating prompt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof NewPrompt, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'images' | 'collaborators' | 'collections', value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, [field]: arrayValue }))
  }

  const isValid = formData.title.trim() && formData.content.trim()
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.content.trim()
      case 2:
      case 3:
        return true // Optional steps are always valid
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipToEnd = () => {
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="max-h-[85vh] flex flex-col">
      {/* Header with progress steps */}
      <div className="flex-shrink-0 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--flare-cyan)]" />
            <h3 className="text-lg font-semibold text-white">
              Create New Prompt
            </h3>
          </div>
          
          {/* Compact Progress Steps */}
          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`
                    flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300
                    ${currentStep === step.id 
                      ? 'shadow-[0_0_12px_rgba(14,165,233,0.8),0_0_24px_rgba(14,165,233,0.4)] text-[#0ea5e9] bg-[#0ea5e9]/10' 
                      : currentStep > step.id
                      ? 'text-white/90 shadow-[0_0_6px_rgba(255,255,255,0.3)] bg-white/5'
                      : 'text-white/50'
                    }
                  `}>
                    <step.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    currentStep === step.id 
                      ? 'text-[#0ea5e9] font-semibold drop-shadow-[0_0_4px_rgba(14,165,233,0.6)]' 
                      : currentStep > step.id 
                      ? 'text-white/90' 
                      : 'text-white/60'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className={`w-3 h-3 mx-2 transition-all duration-300 ${
                    currentStep > index + 1 ? 'text-white/60' : 'text-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto dialog-scroll">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Essentials */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-white mb-2">
                  Essential Information
                </h4>
                <p className="text-sm text-[var(--flare-cyan)]/80">
                  Let's start with the basics for your prompt
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="title" className="text-sm font-medium text-white">
                      Title *
                    </Label>
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter a descriptive title for your prompt..."
                    className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="content" className="text-sm font-medium text-white">
                      Prompt Content *
                    </Label>
                  </div>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Write your prompt instructions here. Be clear and specific about what you want the AI to do..."
                    className="min-h-[120px] bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/50 transition-all duration-300 resize-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-white mb-2">
                  Additional Details
                </h4>
                <p className="text-sm text-[var(--flare-cyan)]/80">
                  Enhance your prompt with description, tags, and visibility settings
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="description" className="text-sm font-medium text-white">
                      Description
                    </Label>
                  </div>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of what this prompt does..."
                    className="bg-white/10 border-[var(--flare-cyan)]/50 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="tags" className="text-sm font-medium text-white">
                      Tags
                    </Label>
                  </div>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="coding, creative, business, writing..."
                    className="bg-white/10 border-[var(--flare-cyan)]/50 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                  />
                  <p className="text-xs text-[var(--flare-cyan)]/70">
                    Add tags to help organize and find your prompt later
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="visibility" className="text-sm font-medium text-white">
                      Visibility
                    </Label>
                  </div>
                  <select
                    id="visibility"
                    value={formData.visibility}
                    onChange={(e) => handleChange('visibility', e.target.value as 'public' | 'private' | 'unlisted')}
                    className="w-full px-3 py-2.5 bg-white/10 border border-[var(--flare-cyan)]/50 text-white rounded-md focus:outline-none focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                  >
                    <option value="private">Private (only you can see)</option>
                    <option value="unlisted">Unlisted (accessible via link)</option>
                    <option value="public">Public (visible to everyone)</option>
                  </select>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--flare-cyan)]/70">
                    {formData.visibility === 'private' && (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Only you can see this prompt</span>
                      </>
                    )}
                    {formData.visibility === 'unlisted' && (
                      <>
                        <Link className="w-3 h-3" />
                        <span>Accessible via direct link only</span>
                      </>
                    )}
                    {formData.visibility === 'public' && (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>Visible to everyone in the marketplace</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Advanced */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-white mb-2">
                  Advanced Options
                </h4>
                <p className="text-sm text-[var(--flare-cyan)]/80">
                  Add images, collaborators, and organize into collections
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="images" className="text-sm font-medium text-white">
                      Images
                    </Label>
                  </div>
                  <Input
                    id="images"
                    value={formData.images.join(', ')}
                    onChange={(e) => handleArrayChange('images', e.target.value)}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                  />
                  <p className="text-xs text-[var(--flare-cyan)]/70">
                    Add image URLs to include visual references
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="collaborators" className="text-sm font-medium text-white">
                      Collaborators
                    </Label>
                  </div>
                  <Input
                    id="collaborators"
                    value={formData.collaborators.join(', ')}
                    onChange={(e) => handleArrayChange('collaborators', e.target.value)}
                    placeholder="Enter usernames or email addresses"
                    className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                  />
                  <p className="text-xs text-[var(--flare-cyan)]/70">
                    Share editing access with other users
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[var(--warning-amber)]" />
                    <Label htmlFor="collections" className="text-sm font-medium text-white">
                      Collections
                    </Label>
                  </div>
                  <Input
                    id="collections"
                    value={formData.collections.join(', ')}
                    onChange={(e) => handleArrayChange('collections', e.target.value)}
                    placeholder="Enter collection names"
                    className="bg-white/10 border-[var(--flare-cyan)]/40 text-white placeholder:text-white/70 focus:border-[var(--wisp-blue)] focus:ring-1 focus:ring-[var(--wisp-blue)]/40 transition-all duration-300"
                  />
                  <p className="text-xs text-[var(--flare-cyan)]/70">
                    Organize this prompt into existing collections
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/wisp.svg" 
                    alt="Wisp Mascot" 
                    className="w-24 h-24 opacity-90 drop-shadow-[0_0_12px_rgba(14,165,233,0.4)]"
                  />
                </div>
                <h4 className="text-xl font-medium text-white mb-3">
                  You're All Set!
                </h4>
                <p className="text-sm text-[var(--flare-cyan)]/80 max-w-md mx-auto leading-relaxed">
                  Your prompt has been configured and is ready to be created. 
                  All the details look great, and you're good to go!
                </p>
              </div>

              <div className="bg-gradient-to-br from-white/8 to-[var(--flare-cyan)]/5 border border-[var(--flare-cyan)]/30 rounded-xl p-6 space-y-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--wisp-blue)]/20 border border-[var(--wisp-blue)]/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[var(--wisp-blue)]" />
                  </div>
                  <h5 className="text-base font-semibold text-white">Prompt Summary</h5>
                </div>
                
                <div className="grid gap-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[var(--warning-amber)]" />
                      <span className="text-sm text-white/80">Title:</span>
                    </div>
                    <span className="text-sm text-white font-medium max-w-[200px] truncate" title={formData.title}>
                      {formData.title || 'Untitled'}
                    </span>
                  </div>
                  
                  {formData.description && (
                    <div className="flex items-start justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--warning-amber)] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">Description:</span>
                      </div>
                      <span className="text-sm text-white/90 max-w-[200px] text-right" title={formData.description}>
                        {formData.description.length > 40 ? `${formData.description.slice(0, 40)}...` : formData.description}
                      </span>
                    </div>
                  )}
                  
                  {formData.tags && (
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-[var(--warning-amber)]" />
                        <span className="text-sm text-white/80">Tags:</span>
                      </div>
                      <span className="text-sm text-white/90 max-w-[200px] truncate" title={formData.tags}>
                        {formData.tags}
                      </span>
                    </div>
                  )}
                  
                  {formData.images.length > 0 && (
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[var(--warning-amber)]" />
                        <span className="text-sm text-white/80">Images:</span>
                      </div>
                      <span className="text-sm text-[var(--flare-cyan)] font-medium">
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {formData.collaborators.length > 0 && (
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--warning-amber)]" />
                        <span className="text-sm text-white/80">Collaborators:</span>
                      </div>
                      <span className="text-sm text-[var(--flare-cyan)] font-medium">
                        {formData.collaborators.length} collaborator{formData.collaborators.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {formData.collections.length > 0 && (
                    <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[var(--warning-amber)]" />
                        <span className="text-sm text-white/80">Collections:</span>
                      </div>
                      <span className="text-sm text-[var(--flare-cyan)] font-medium">
                        {formData.collections.length} collection{formData.collections.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--warning-amber)]" />
                      <span className="text-sm text-white/80">Visibility:</span>
                    </div>
                    <span className="text-sm text-[var(--flare-cyan)] capitalize font-medium">
                      {formData.visibility}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Navigation Footer */}
      <div className="flex-shrink-0 pt-6 mt-4 border-t border-[var(--flare-cyan)]/20">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2 border-white/50 text-white/70 hover:bg-white/5 hover:border-white hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-[var(--flare-cyan)]/60 text-[var(--flare-cyan)]/70 hover:bg-[var(--flare-cyan)]/10 hover:border-[var(--flare-cyan)] hover:text-[var(--flare-cyan)] transition-all duration-300"
            >
              Cancel
            </Button>
          </div>

          {/* Progress Bar - Centered between buttons */}
          <div className="flex justify-center">
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--wisp-blue)] to-[var(--flare-cyan)] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(14,165,233,0.8)]"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(currentStep === 2 || currentStep === 3) && !steps[currentStep - 1].required && (
                <Button
                type="button"
                variant="icon"
                onClick={skipToEnd}
                className="text-gray-300/70 wispy-text-glow hover:text-white hover:shadow-lg duration-300"
                >
                Skip
                </Button>
            )}
            
            {currentStep < 4 ? (
              <Button
                type="button"
                disabled={!isStepValid(currentStep)}
                onClick={nextStep}
                className="flex items-center gap-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white transition-all duration-300 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {currentStep === 3 ? 'Review' : 'Save'}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Prompt!
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
