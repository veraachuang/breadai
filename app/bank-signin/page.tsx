"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function BankSigninPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
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

          <h2 className="text-lg font-medium text-brown-1000 mb-2">Sign In to Bank</h2>
          <p className="text-xs text-brown-900 mb-6">Use your bank credentials to connect</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="Bank Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button type="submit" className="primary-button">
                Sign In
              </button>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-1/2"></div>
      </div>
    </main>
  )
}

