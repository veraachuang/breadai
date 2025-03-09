"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/bank-connection")
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

          <h2 className="text-lg font-medium text-brown-1000 mb-4">Sign Up With BreadAI</h2>

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="Email Address"
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
            <div>
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button type="submit" className="primary-button">
                Continue
              </button>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-1/2">
          <div className="wave-pattern"></div>
        </div>
      </div>
    </main>
  )
}

