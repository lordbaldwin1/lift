"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Loader2, LogIn, Mail, User2Icon, UserRound } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { authClient, signOut } from "~/server/auth/auth-client";

export default function Navbar() {
  const {
    data: session,
    isPending,
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()

  function handleSignOut() {
    signOut();
  }

  return (
    <section className="flex flex-row items-center justify-between">
      <div className="space-x-4">
        <Link href={"/"} className="text-xl">lift</Link>
        <Link href={"/workout"} className="hover:text-muted-foreground">workout</Link>
      </div>
      <div className="flex flex-row items-center">
        <ThemeToggle />
        {isPending ? (
          <Loader2 className="animate-spin w-[40]" size={18} />
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"link"} className="hover:text-muted-foreground">
                <UserRound />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-center">my account</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User2Icon />
                  <DropdownMenuShortcut>
                    {session.user.name}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail />
                  <DropdownMenuShortcut>
                    {session.user.email}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex justify-center" onClick={handleSignOut}>
                log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={"/login"} className="hover:text-muted-foreground">
            <LogIn size={18} />
          </Link>
        )}
      </div>
    </section>
  )
}