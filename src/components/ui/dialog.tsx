'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@/lib/utils'

interface DialogProps extends VariantProps<typeof dialogVariants> {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  variant?: "default" | "transparent" | "tool"
}

const dialogVariants = cva(
  "bg-[var(--deep-charcoal)] border border-[var(--moonlight-silver-dim)] rounded-lg shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-[var(--deep-charcoal)] border border-[var(--moonlight-silver-dim)]",
        transparent: "bg-transparent border-none shadow-none",
        tool: "bg-[var(--deep-charcoal)] border border-[var(--moonlight-silver-dim)]", // content stays the same, only portal bg changes
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export default function Dialog({ isOpen, onClose, title, children, maxWidth = "max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-7xl", variant = "default" }: DialogProps) {
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
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8",
        variant === "tool"
          ? "bg-transparent backdrop-blur-none"
          : "bg-black/60 backdrop-blur-sm"
      )}
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className={cn(dialogVariants({ variant }), maxWidth, "w-full mx-4 max-h-[90vh] flex flex-col")}
      >
        {title && (
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
        )}
        {!title && (
          <div className="flex justify-end p-2 absolute top-2 right-2 z-10">
            <Button
              onClick={onClose}
              variant="icon"
              size="sm"
              className="h-8 w-8 p-0 hover:text-[var(--glow-ember)] bg-[var(--deep-charcoal)]/80 backdrop-blur-sm"
            >
              <X size={16} />
            </Button>
          </div>
        )}
        <div className={`${title ? 'p-4' : 'p-4'}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
