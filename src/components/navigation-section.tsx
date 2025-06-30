"use client"

import { Button } from "@/components/ui/button"
import { Home, BookOpen, Search } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/appContext"
import { useState } from "react"
import NavSearchModal from "./nav-search"

export function NavigationSection() {
  const { state, actions } = useApp()
  const { selectedFilter } = state.filters
  const [searchOpen, setSearchOpen] = useState(false)

  type ButtonVariant = "ghost" | "default" | "link" | "destructive" | "outline" | "secondary" | "icon";

  const navigationItems: Array<{
    key: string;
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant: ButtonVariant;
    className?: string;
    href?: string;
  }> = [
    {
      key: "search",
      icon: Search,
      label: "Search",
      onClick: () => setSearchOpen(true),
      variant: "ghost",
    },
    {
      key: "home",
      icon: Home,
      label: "Home",
      href: "/prompt",
      onClick: () => actions.setFilter("home"),
      variant: selectedFilter === "home" ? "default" : "ghost",
      className:
        selectedFilter === "home"
          ? "bg-[var(--wisp-blue)] text-white shadow-sm"
          : "text-[var(--moonlight-silver-bright)]",
    },/*
    {
      key: "favorites",
      icon: Star,
      label: "Favorites",
      onClick: () => actions.setFilter("favorites"),
      variant: selectedFilter === "favorites" ? "default" : "ghost",
      className:
        selectedFilter === "favorites"
          ? "bg-[var(--wisp-blue)] text-white shadow-sm"
          : "text-[var(--moonlight-silver-bright)]",
    },*/
    {
      key: "all",
      icon: BookOpen,
      label: "All Prompts",
      onClick: () => actions.setFilter("all"),
      variant: selectedFilter === "all" ? "default" : "ghost",
      className:
        selectedFilter === "all"
          ? "bg-[var(--wisp-blue)] text-white shadow-sm"
          : "text-[var(--moonlight-silver-bright)]",
    },/*
    {
      key: "your",
      icon: Edit,
      label: "Your Prompts",
      onClick: () => actions.setFilter("your"),
      variant: selectedFilter === "your" ? "default" : "ghost",
      className:
        selectedFilter === "your"
          ? "bg-[var(--wisp-blue)] text-white shadow-sm"
          : "text-[var(--moonlight-silver-bright)]",
    },
    {
      key: "saved",
      icon: Archive,
      label: "Saved",
      onClick: () => actions.setFilter("saved"),
      variant: selectedFilter === "saved" ? "default" : "ghost",
      className:
        selectedFilter === "saved"
          ? "bg-[var(--flare-cyan)] text-white shadow-sm"
          : "text-[var(--moonlight-silver-bright)]",
    },*/
  ]

  return (
    <div className="flex-shrink-0 gap-y-3 flex flex-col items-center mb-6">
      {navigationItems.map((item) => {
        const ButtonComponent = (
          <Button
            key={item.key}
            variant={item.variant}
            className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${item.className || ""}`}
            onClick={item.onClick}
            title={item.label}
          >
            <item.icon size={16} className="flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </Button>
        )

        return item.href ? (
          <Link key={item.key} href={item.href} className="w-full justify-start p-0 m-0">
            {ButtonComponent}
          </Link>
        ) : (
          ButtonComponent
        )
      })}
      {searchOpen && (
        <NavSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  )
}
