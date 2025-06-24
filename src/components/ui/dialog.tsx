'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Dialog({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className={`bg-[var(--deep-charcoal)] border border-[var(--moonlight-silver-dim)] rounded-lg shadow-xl ${maxWidth} w-full mx-4`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--moonlight-silver-dim)]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <Button
            onClick={onClose}
            variant="icon"
            size="sm"
            className="h-8 w-8 p-0 hover:text-[var(--glow-ember)]"
          >
            <X size={16} />
          </Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
