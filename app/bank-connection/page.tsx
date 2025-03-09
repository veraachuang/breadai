"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Shield, Lock, BanknoteIcon as Bank, CreditCard } from "lucide-react"

export default function BankConnectionPage() {
  const router = useRouter()
  const [bankUsername, setBankUsername] = useState("")
  const [bankPassword, setBankPassword] = useState("")
  const [selectedBank, setSelectedBank] = useState("")

  const popularBanks = ["Chase", "Bank of America", "Wells Fargo", "Citibank", "Capital One"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/goals")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-primary flex items-center">
            <span className="bg-blue-primary text-white p-1 rounded-sm text-xs mr-1">🍞</span>
            BreadAI
          </h1>
          <button className="text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step 2 of 4</span>
            <span>Bank Connection</span>
          </div>
          <div className="progress-bar">
            <div className="progress-step bg-blue-primary" style={{ width: "50%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
          <div className="flex items-center mb-4 text-blue-primary">
            <Shield className="mr-2" size={20} />
            <h2 className="text-lg font-medium">Secure Bank Connection</h2>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Connect your bank account securely. BreadAI uses bank-level encryption and never stores your credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Bank</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-primary focus:border-blue-primary"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">Select a bank</option>
                {popularBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Username</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-primary focus:border-blue-primary"
                  value={bankUsername}
                  onChange={(e) => setBankUsername(e.target.value)}
                />
                <Bank className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Password</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-primary focus:border-blue-primary"
                  value={bankPassword}
                  onChange={(e) => setBankPassword(e.target.value)}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="blue-button">
                Connect Securely
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">Or connect with</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <CreditCard size={16} className="mr-2 text-blue-primary" />
                <span className="text-sm">Plaid</span>
              </button>
              <button className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Bank size={16} className="mr-2 text-blue-primary" />
                <span className="text-sm">Yodlee</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
            <Lock size={12} className="mr-1" />
            <span>Your credentials are encrypted and secure</span>
          </div>
        </div>
      </div>
    </main>
  )
}

