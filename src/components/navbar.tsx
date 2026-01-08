"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Loader, User2Icon, UserRound } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { authClient, signOut } from "~/server/auth/auth-client";
import Image from "next/image";

export default function Navbar() {
  const {
    data: session,
    isPending,
  } = authClient.useSession()

  function handleSignOut() {
    void signOut();
  }

  return (
    <nav className="flex items-center justify-between py-2">
      <div className="flex items-center gap-8">
        <Link href="/" className="group flex items-baseline">
          <span className="font-display text-3xl tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            LIFT
          </span>
          <span className="font-display text-3xl tracking-tight text-primary transition-colors duration-200 group-hover:text-foreground">
            THINGS
          </span>
        </Link>
        <Link 
          href="/workout" 
          className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          Workouts
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <ThemeToggle />
        {isPending ? (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Loader className="h-5 w-5 animate-spin" />
          </Button>
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="your profile picture" 
                    width={32} 
                    height={32} 
                    className="rounded-full ring-2 ring-border" 
                  />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`/account/${session.user.id}`} className="cursor-pointer">
                    <User2Icon className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-muted-foreground focus:text-foreground cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button size="sm" className="font-medium">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}