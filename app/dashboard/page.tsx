"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, DollarSign, Coffee, ShoppingBag, Car, Lightbulb, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("monthly")

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">Financial Overview</h1>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="stat-title">Total Balance</div>
              <DollarSign size={18} className="text-[#9c6644] opacity-70" />
            </div>
            <div className="stat-value">$12,546.21</div>
            <div className="stat-change positive">
              <TrendingUp size={14} className="mr-1" />
              <span>+2.5% from last month</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="stat-title">Monthly Income</div>
              <TrendingUp size={18} className="text-[#4d7c0f] opacity-70" />
            </div>
            <div className="stat-value">$4,850.00</div>
            <div className="stat-change positive">
              <TrendingUp size={14} className="mr-1" />
              <span>+5.2% from last month</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="stat-title">Monthly Expenses</div>
              <TrendingDown size={18} className="text-[#b91c1c] opacity-70" />
            </div>
            <div className="stat-value">$3,248.67</div>
            <div className="stat-change negative">
              <TrendingDown size={14} className="mr-1" />
              <span>-1.8% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="dashboard-card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-[#3a3027]">Spending Patterns</h2>
          <div className="flex bg-[#e8e1d9] rounded-md p-0.5">
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "monthly" ? "bg-white text-[#3a3027] shadow-sm" : "text-[#3a3027] hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "weekly" ? "bg-white text-[#3a3027] shadow-sm" : "text-[#3a3027] hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "daily" ? "bg-white text-[#3a3027] shadow-sm" : "text-[#3a3027] hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("daily")}
            >
              Daily
            </button>
          </div>
        </div>

        <div className="chart-container">
          {/* This would be a real chart in production */}
          <div className="w-full h-full bg-[#f8f5f0] rounded-lg flex items-center justify-center border border-[#e6dfd5]">
            <p className="text-[#3a3027] opacity-60">Spending Chart Visualization</p>
          </div>
        </div>
      </div>

      {/* Budget Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[#3a3027]">Budget Categories</h2>
        <button className="text-sm text-[#9c6644] font-medium flex items-center hover:underline">
          View all <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="dashboard-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#f0fdf4] flex items-center justify-center mr-3">
                <Coffee size={16} className="text-[#4d7c0f]" />
              </div>
              <span className="font-medium text-[#3a3027]">Coffee & Dining</span>
            </div>
            <span className="text-sm font-medium text-[#3a3027]">$420/$500</span>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-bar warning" style={{ width: "84%" }}></div>
          </div>
          <p className="text-xs text-[#3a3027] opacity-60 mt-1">84% of monthly budget used</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#f0fdf4] flex items-center justify-center mr-3">
                <ShoppingBag size={16} className="text-[#4d7c0f]" />
              </div>
              <span className="font-medium text-[#3a3027]">Shopping</span>
            </div>
            <span className="text-sm font-medium text-[#3a3027]">$310/$600</span>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-bar good" style={{ width: "52%" }}></div>
          </div>
          <p className="text-xs text-[#3a3027] opacity-60 mt-1">52% of monthly budget used</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#fef2f2] flex items-center justify-center mr-3">
                <Car size={16} className="text-[#b91c1c]" />
              </div>
              <span className="font-medium text-[#3a3027]">Transportation</span>
            </div>
            <span className="text-sm font-medium text-[#3a3027]">$280/$300</span>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-bar danger" style={{ width: "93%" }}></div>
          </div>
          <p className="text-xs text-[#3a3027] opacity-60 mt-1">93% of monthly budget used</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#3a3027] flex items-center">
            <Lightbulb size={18} className="mr-2 text-[#d4a373]" />
            AI Recommendations
          </h2>
          <button className="text-sm text-[#9c6644] font-medium flex items-center hover:underline">
            View all <ChevronRight size={16} />
          </button>
        </div>

        <div className="recommendation-card">
          <h3 className="recommendation-title">Optimize Your Coffee Budget</h3>
          <p className="recommendation-content">
            You're spending $15/week at premium coffee shops. Making coffee at home 3 days a week could save you $78
            this month.
          </p>
          <button className="recommendation-action">
            Apply this suggestion <ChevronRight size={16} />
          </button>
        </div>

        <div className="recommendation-card">
          <h3 className="recommendation-title">Subscription Overlap Detected</h3>
          <p className="recommendation-content">
            You're paying for both Netflix ($14.99) and Hulu ($11.99) with similar content. Consider consolidating to
            save $11.99 monthly.
          </p>
          <button className="recommendation-action">
            View details <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

