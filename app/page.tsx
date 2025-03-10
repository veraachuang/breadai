"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X } from "lucide-react"
import { BreadAILogo } from "@/components/logo"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid username or password")
        return
      }

      router.push("/dashboard")
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#f8f5f0]">
      <div className="auth-container w-full max-w-md flex flex-col md:flex-row shadow-lg">
        <div className="auth-form w-full md:w-1/2 bg-white p-8 rounded-l-lg">
          <div className="flex justify-between items-center mb-8">
            <BreadAILogo />
            <button className="text-[#3a3027] opacity-60 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-[#3a3027]">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#3a3027] mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3a3027] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="pt-2">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>
            <div className="mt-4 text-center space-y-2">
              <Link
                href="/signup"
                className="text-amber-600 hover:text-amber-700 transition-colors block"
              >
                Create an account
              </Link>
              <Link
                href="/forgot-password"
                className="text-amber-600 hover:text-amber-700 transition-colors block"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-full md:w-1/2 hidden md:block bg-gradient-to-br from-amber-500 to-amber-700 p-8 rounded-r-lg">
          <div className="h-full flex flex-col justify-center text-white">
            <h3 className="text-xl font-semibold mb-4">Smart Banking for Students</h3>
            <p className="text-sm opacity-90">
              Track expenses, set budgets, and get personalized financial insights tailored for college life.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

