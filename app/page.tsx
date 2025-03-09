"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X } from "lucide-react"
import { BreadAILogo } from "@/components/logo"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#f8f5f0]">
      <div className="auth-container w-full max-w-md flex flex-col md:flex-row shadow-lg">
        <div className="auth-form w-full md:w-1/2">
          <div className="flex justify-between items-center mb-8">
            <BreadAILogo />
            <button className="text-[#3a3027] opacity-60 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-[#3a3027]">Welcome back</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#3a3027] mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3a3027] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button type="submit" className="primary-button">
                Sign In
              </button>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Link href="/forgot-password" className="text-link text-sm">
                Forgot password?
              </Link>
              <Link href="/signup" className="text-link text-sm">
                Create account
              </Link>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-full md:w-1/2 hidden md:block">
          <div className="auth-pattern"></div>
          <div className="p-8 h-full flex flex-col justify-center">
            <h3 className="text-white text-xl font-semibold mb-4">Smart Banking for Students</h3>
            <p className="text-white text-sm opacity-90">
              Track expenses, set budgets, and get personalized financial insights tailored for college life.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

