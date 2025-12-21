import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import Navbar from "~/components/navbar";
import { Toaster } from "~/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "~/components/query-provider";
import Footer from "~/components/footer";

export const metadata: Metadata = {
  title: "lift",
  description: "hypertrophy training application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 flex flex-col flex-1">
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <Footer />
              <Toaster position="top-center" />
            </ThemeProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
