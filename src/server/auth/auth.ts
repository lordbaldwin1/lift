import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db/index";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    socialProviders: {
        google: { 
            prompt: "select_account",
            clientId: env.GOOGLE_CLIENT_ID, 
            clientSecret: env.GOOGLE_CLIENT_SECRET, 
        }, 
    },
});