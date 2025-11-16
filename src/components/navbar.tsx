"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Anvil, Loader2, LogIn, Mail, User2Icon, UserRound } from "lucide-react";
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
    <section className="flex flex-row items-end justify-between bg-transparent">
      <div className="space-x-4 flex flex-row items-end">
        <Link href={"/"} className="text-xl flex flex-row items-end gap-1">
          <h1 className="font-bold tracking-tighter text-3xl md:block lg:block">lift.</h1>
        </Link>
        <Link href={"/workout"} className="hover:text-accent tracking-tighter duration-200 text-lg">workouts</Link>
      </div>
      <div className="flex flex-row items-center">
        <ThemeToggle />
        {isPending ? (
          <Loader2 className="animate-spin w-[68]" size={36} />
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"link"} className="hover:text-muted-foreground">
                {
                  session.user.image
                    ? <Image src={session.user.image} alt="your profile picture" width={36} height={36} className="rounded-full" />
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