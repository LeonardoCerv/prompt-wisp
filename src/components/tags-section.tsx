"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useApp } from "@/contexts/appContext"

export function TagsSection() {
  const { state, actions } = useApp()
  const { tags } = state
  const { tagsExpanded } = state.ui
  const { selectedTags } = state.filters

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

    actions.setFilter("tags", { tags: newSelectedTags })
  }

  return (
    <div className="space-y-2 px-2">
      <h3
        className="text-[10px] font-medium text-[var(--flare-cyan)] uppercase tracking-wider mb-3 cursor-pointer hover:text-[var(--flare-cyan)]/70 transition-colors flex items-center justify-between"
        onClick={actions.toggleTagsExpanded}
      >
        Tags
        {tagsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </h3>

      {tagsExpanded && (
        <div className="space-y-1">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant="ghost"
              className={`w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                selectedTags.includes(tag)
                  ? "bg-[var(--flare-cyan)]/20 text-[var(--flare-cyan)]"
                  : "text-[var(--moonlight-silver)]"
              }`}
              onClick={() => handleTagClick(tag)}
              title={`#${tag}`}
            >
              <span className="truncate">#{tag}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
