import {
    createAuthClient
} from "better-auth/react";
import { env } from "~/env";


export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;

// Client side usage
/*
import { authClient } from "@/lib/auth-client" // import the auth client

export function User(){

    const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 

    return (
        //...
    )
}
*/

// Server side usage
/*
import { auth } from "./auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})
*/