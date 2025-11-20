"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  function handleToggleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <>
      <button onClick={handleToggleTheme} className="flex items-center hover:text-muted-foreground duration-200">
        <Sun size={18} className="dark:scale-0 dark:-rotate-90" />
        <Moon size={18} className="absolute dark:scale-100 dark:rotate-0 scale-0" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </>
  )
}
