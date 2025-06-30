import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "editor"
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  const editorStyles =
    "border-none bg-transparent shadow-none outline-none focus:outline-none focus:ring-0 focus:border-0 px-0 py-0 m-0 h-auto w-full text-white caret-primary placeholder:text-muted cursor-text transition-none rounded-none";

  // If editor variant, set anti-autofill props unless explicitly provided
  const editorProps =
    variant === "editor"
      ? {
          autoComplete: "off",
          autoCorrect: "off",
          spellCheck: false,
          autoCapitalize: "off",
          ...props,
        }
      : props;

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        variant === "editor"
          ? editorStyles
          : "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...editorProps}
    />
  )
}

export { Input }
