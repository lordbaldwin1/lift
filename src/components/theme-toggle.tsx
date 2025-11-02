"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "~/components/ui/button"

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
        <Button variant="link" onClick={handleToggleTheme} className="hover:text-muted-foreground">
            <Sun className="dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute dark:scale-100 dark:rotate-0 scale-0" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
