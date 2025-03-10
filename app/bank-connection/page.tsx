"use client"

import { X } from "lucide-react"
import PlaidLink from '@/components/PlaidLink'

export default function BankConnectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f5f0]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-[#3a3027]">Connect Your Bank</h1>
          <button className="text-[#3a3027] opacity-60 hover:opacity-100 transition-opacity">
            <X size={18} />
          </button>
        </div>
        <PlaidLink />
      </div>
    </div>
  )
}

