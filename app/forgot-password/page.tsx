"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/verification")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="auth-container w-full max-w-md flex flex-row">
        <div className="auth-form w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-brown-1000">BreadAI</h1>
            <button className="text-brown-1000">
              <X size={16} />
            </button>
          </div>

          <h2 className="text-lg font-medium text-brown-1000 mb-4">Forgot Password?</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button type="submit" className="primary-button">
                Reset
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-brown-1000">or</p>
            </div>
            <div>
              <Link href="/" className="text-link block text-center">
                Return to login
              </Link>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-1/2"></div>
      </div>
    </main>
  )
}

