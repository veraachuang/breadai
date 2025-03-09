"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function VerificationPage() {
  const router = useRouter()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Move to next input if current one is filled
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/bank-signin")
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

          <h2 className="text-lg font-medium text-brown-1000 mb-2">Enter Verification Code</h2>
          <p className="text-xs text-brown-900 mb-4">
            Please enter the 6 digit verification code we sent to your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  className="verification-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            <div className="text-center">
              <button type="button" className="text-link">
                Resend Code
              </button>
            </div>

            <div>
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

