"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, PiggyBank, TrendingDown, TrendingUp, ArrowRight } from "lucide-react"

export default function GoalsPage() {
  const router = useRouter()
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal)
  }

  const handleContinue = () => {
    if (selectedGoal) {
      router.push("/dashboard")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-3xl">
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
            <span>Step 3 of 4</span>
            <span>Financial Goals</span>
          </div>
          <div className="progress-bar">
            <div className="progress-step bg-blue-primary" style={{ width: "75%" }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">What's your primary financial goal?</h2>
          <p className="text-gray-600">
            Select the goal that matters most to you. Our AI will customize your experience based on your selection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Save More Goal */}
          <div
            className={`goal-card bg-white shadow-md ${selectedGoal === "save" ? "selected" : ""}`}
            onClick={() => handleGoalSelect("save")}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-accent/20 flex items-center justify-center">
                <PiggyBank size={32} className="text-blue-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Save More</h3>
            <p className="text-gray-600 text-sm text-center">
              Build your emergency fund, save for big purchases, or just grow your savings consistently.
            </p>
          </div>

          {/* Reduce Debt Goal */}
          <div
            className={`goal-card bg-white shadow-md ${selectedGoal === "debt" ? "selected" : ""}`}
            onClick={() => handleGoalSelect("debt")}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown size={32} className="text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Reduce Debt</h3>
            <p className="text-gray-600 text-sm text-center">
              Pay down credit cards, loans, or other debts with optimized payment strategies.
            </p>
          </div>

          {/* Build Wealth Goal */}
          <div
            className={`goal-card bg-white shadow-md ${selectedGoal === "wealth" ? "selected" : ""}`}
            onClick={() => handleGoalSelect("wealth")}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-accent/20 flex items-center justify-center">
                <TrendingUp size={32} className="text-green-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Build Wealth</h3>
            <p className="text-gray-600 text-sm text-center">
              Grow your investments, plan for retirement, and build long-term financial security.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className={`blue-button flex items-center justify-center max-w-xs ${!selectedGoal ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleContinue}
            disabled={!selectedGoal}
          >
            <span>Continue</span>
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </main>
  )
}

