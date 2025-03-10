"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X } from "lucide-react"
import { BreadAILogo } from "@/components/logo"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      })

      // Check if response has content
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server: Not JSON")
      }

      const text = await response.text() // Get response as text first
      if (!text) {
        throw new Error("Empty response from server")
      }

      let data
      try {
        data = JSON.parse(text) // Parse the text as JSON
      } catch (e) {
        console.error("Failed to parse response:", e, "Response text:", text)
        throw new Error("Invalid response format from server")
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Sign in automatically after successful signup
      const signInResult = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error("Account created but failed to sign in automatically")
      }

      // Redirect to dashboard on success
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong")
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
            <Link href="/" className="text-[#3a3027] opacity-60 hover:opacity-100 transition-opacity">
              <X size={18} />
            </Link>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-[#3a3027]">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
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
                placeholder="Enter your username"
                required
                minLength={3}
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
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3a3027] mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </div>
            <div className="text-center pt-2">
              <Link href="/" className="text-sm text-amber-600 hover:text-amber-700">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-full md:w-1/2 hidden md:block bg-gradient-to-br from-amber-500 to-amber-700 p-8 rounded-r-lg">
          <div className="h-full flex flex-col justify-center text-white">
            <h3 className="text-xl font-semibold mb-4">Join BreadAI Today</h3>
            <p className="text-sm opacity-90">
              Start your journey to better financial management with AI-powered insights and automated tracking.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

