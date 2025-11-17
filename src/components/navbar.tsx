"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { DumbbellIcon, Loader, Mail, User2Icon, UserRound } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
      <div className="space-x-8 flex flex-row items-end">
        <Link href={"/"} className="text-xl">
          <h1 className="font-bold tracking-tighter text-4xl md:block lg:block">Lift.</h1>
        </Link>
        <Link href={"/workout"} className="hover:text-muted-foreground duration-200 text-lg">
          Workouts
        </Link>
      </div>
      <div className="flex flex-row">
        <ThemeToggle />
        {isPending ? (
          <Button variant={"link"} className="w-[64]">
            <Loader className="animate-spin" size={32} />
          </Button>
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"link"} className="hover:text-muted-foreground">
                {
                  session.user.image
                    ? <Image src={session.user.image} alt="your profile picture" width={32} height={32} className="rounded-full" />
                    : <UserRound />
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-center">My Account</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User2Icon />
                  <DropdownMenuShortcut>
                    <Link href={`/account/${session.user.id}`}>
                      {session.user.name}
                    </Link>
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex justify-center" onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={"/login"} className="hover:text-muted-foreground">
            <Button className="rounded-full ml-4">
              sign in
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}