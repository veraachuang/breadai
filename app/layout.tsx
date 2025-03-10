import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "./_trpc/provider"
import { Header } from "@/components/Header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/server/auth"
import { SessionProvider } from "@/components/SessionProvider"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "BreadAI - Smart Financial Management",
  description: "AI-powered financial management platform",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={poppins.className}>
        <SessionProvider session={session}>
          <TRPCProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>{children}</main>
            </div>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

