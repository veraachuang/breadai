'use client';

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import PlaidLink from '@/components/PlaidLink'

export default function LinkBankPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-[#3a3027]">Connect Your Bank</h1>
        </div>

        <p className="mb-8 text-[#3a3027] opacity-80">
          Connect your bank account securely to start tracking your expenses and get personalized insights.
        </p>

        <PlaidLink />

        <div className="mt-8 text-center">
          <Link 
            href="/dashboard" 
            className="text-amber-600 hover:text-amber-700 transition-colors"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  )
} 