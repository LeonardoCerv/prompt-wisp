import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "editor"
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, variant = "default", ...props }, ref) => {
  const baseClass =
    variant === "editor"
      ? "flex min-h-[200px] w-full rounded-md border border-[var(--moonlight-silver-dim)] bg-[var(--black)] text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--glow-ember)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-[1.5] p-0 m-0"
      : "flex min-h-[200px] w-full rounded-md border border-[var(--moonlight-silver-dim)] bg-[var(--black)] px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--glow-ember)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
  return (
    <textarea
      className={cn(baseClass, className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
