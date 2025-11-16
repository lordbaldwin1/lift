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
    <section className="flex flex-row items-center justify-between bg-transparent">
      <div className="space-x-4">
        <Link href={"/"} className="text-xl">lift</Link>
        <Link href={"/workout"} className="hover:text-muted-foreground">workouts</Link>
        <Link href={"/workout/create"} className="hover:text-muted-foreground">create workout</Link>
      </div>
      <div className="flex flex-row items-center">
        <ThemeToggle />
        {isPending ? (
          <Loader2 className="animate-spin w-[40]" size={18} />
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"link"} className="hover:text-muted-foreground">
                {
                  session.user.image
                    ? <Image src={session.user.image} alt="your profile picture" width={25} height={25} className="rounded-full" />
                    : <UserRound />
                }
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