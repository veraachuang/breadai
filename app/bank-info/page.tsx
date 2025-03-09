"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function BankInfoPage() {
  const router = useRouter()
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

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

          <h2 className="text-lg font-medium text-brown-1000 mb-2">Enter Bank Information</h2>
          <p className="text-xs text-brown-900 mb-4">We need your bank information to connect your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Bank Name"
                className="input-field"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Account Number"
                className="input-field"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button type="submit" className="primary-button">
                Continue
              </button>
            </div>
          </form>
        </div>
        <div className="auth-gradient w-1/2"></div>
      </div>
    </main>
  )
}

