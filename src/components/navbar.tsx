import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { auth } from "~/server/auth/auth";
import { headers } from "next/headers";
import { LogIn, UserRound } from "lucide-react";
import { Button } from "./ui/button";


export default async function Navbar() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return (
        <section className="flex flex-row items-center justify-between">
            <Link href={"/"} className="text-xl">lift</Link>
            <div>
                <ThemeToggle />
                {session ? (
                    <Button variant={"link"}>
                        <UserRound />
                    </Button>
                ) : (
                    <Link href={"/login"}>
                        <LogIn />
                    </Link>
                )}
            </div>
        </section>
    )
}