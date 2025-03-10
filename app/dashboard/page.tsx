"use client"

import React from 'react';
import { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, DollarSign, Coffee, ShoppingBag, Car, Lightbulb, ChevronRight, RefreshCw } from "lucide-react"
import { TransactionList } from '@/components/TransactionList'
import { api } from '@/app/_trpc/react'
import { startOfWeek, endOfWeek, startOfDay, endOfDay, subDays } from 'date-fns'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("monthly")
  const utils = api.useContext();

  // Get date ranges based on active tab
  const dateRange = useMemo(() => {
    const now = new Date()
    switch (activeTab) {
      case 'weekly':
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          endDate: endOfWeek(now, { weekStartsOn: 1 }).toISOString()
        }
      case 'daily':
        return {
          startDate: startOfDay(now).toISOString(),
          endDate: endOfDay(now).toISOString()
        }
      case 'monthly':
      default:
        const thirtyDaysAgo = subDays(now, 30)
        return {
          startDate: startOfDay(thirtyDaysAgo).toISOString(),
          endDate: endOfDay(now).toISOString()
        }
    }
  }, [activeTab])

  const { data: spendingData } = api.transaction.getSpendingByCategory.useQuery(dateRange);
  const populateDummyData = api.transaction.populateDummyData.useMutation({
    onSuccess: () => {
      // Invalidate all queries to refresh the data
      utils.transaction.invalidate();
    },
  });

  const handleRefresh = async () => {
    try {
      await populateDummyData.mutateAsync();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Calculate total spending and income
  const { totalSpending, totalIncome } = useMemo(() => {
    if (!spendingData) return { totalSpending: 0, totalIncome: 0 };
    
    const result = {
      totalSpending: 0,
      totalIncome: 0
    };

    spendingData.forEach(({ category, amount }) => {
      if (category === 'Income') {
        result.totalIncome += Math.abs(amount); // Income is stored as positive
      } else {
        result.totalSpending += Math.abs(amount); // Expenses are stored as negative
      }
    });

    return result;
  }, [spendingData]);

  // Calculate spending by category for the chart
  const spendingByCategory = useMemo(() => {
    if (!spendingData) return [];
    return spendingData
      .filter(({ category }) => category !== 'Income')
      .map(({ category, amount }) => ({
        category,
        amount: Math.abs(amount),
        percentage: ((Math.abs(amount) / totalSpending) * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [spendingData, totalSpending]);

  // Get time period label
  const timePeriodLabel = useMemo(() => {
    switch (activeTab) {
      case 'weekly':
        return 'This Week';
      case 'daily':
        return 'Today';
      case 'monthly':
      default:
        return 'Last 30 Days';
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your spending and manage your finances.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={populateDummyData.isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#9c6644] bg-[#f5efe7] rounded-md hover:bg-[#e8e1d9] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={`${populateDummyData.isLoading ? 'animate-spin' : ''}`} />
          {populateDummyData.isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-12">
        <TransactionList />
      </div>

      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">Financial Overview</h1>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="stat-title">Total Balance</div>
              <DollarSign size={18} className="text-[#9c6644] opacity-70" />
            </div>
            <div className="stat-value">${(totalIncome - totalSpending).toFixed(2)}</div>
            <div className={`stat-change ${totalIncome - totalSpending >= 0 ? 'positive' : 'negative'}`}>
              {totalIncome - totalSpending >= 0 ? (
                <TrendingUp size={14} className="mr-1" />
              ) : (
                <TrendingDown size={14} className="mr-1" />
              )}
              <span>Current Balance</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="stat-title">Monthly Income</div>
              <TrendingUp size={18} className="text-[#4d7c0f] opacity-70" />
            </div>
            <div className="stat-value">${totalIncome.toFixed(2)}</div>
            <div className="stat-change positive">
              <TrendingUp size={14} className="mr-1" />
              <span>Total Income</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="stat-title">Monthly Expenses</div>
              <TrendingDown size={18} className="text-[#b91c1c] opacity-70" />
            </div>
            <div className="stat-value">${totalSpending.toFixed(2)}</div>
            <div className="stat-change negative">
              <TrendingDown size={14} className="mr-1" />
              <span>Total Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="dashboard-card mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-medium text-[#3a3027]">Spending Patterns</h2>
            <p className="text-sm text-gray-500">{timePeriodLabel}</p>
          </div>
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

        <div className="p-4">
          {spendingByCategory.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No spending data for this {activeTab.toLowerCase()} period
            </div>
          ) : (
            <div className="grid gap-2">
              {spendingByCategory.map(({ category, amount, percentage }) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center min-w-0">
                      <span className="font-medium text-[#3a3027] truncate">{category}</span>
                      <span className="ml-2 text-[#3a3027] opacity-70">{percentage}%</span>
                    </div>
                    <span className="font-medium text-[#3a3027] ml-4">${amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-[#e8e1d9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9c6644] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-[#e8e1d9]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#3a3027]">Total {activeTab === 'monthly' ? 'Monthly' : activeTab === 'weekly' ? 'Weekly' : 'Daily'} Spending</span>
                  <span className="text-lg font-semibold text-[#3a3027]">${totalSpending.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
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
              <span className="font-medium text-[#3a3027]">Food and Drink</span>
            </div>
            <span className="text-sm font-medium text-[#3a3027]">$67.05/$500</span>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-bar good" style={{ width: "13.4%" }}></div>
          </div>
          <p className="text-xs text-[#3a3027] opacity-60 mt-1">13.4% of monthly budget used</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#f0fdf4] flex items-center justify-center mr-3">
                <ShoppingBag size={16} className="text-[#4d7c0f]" />
              </div>
              <span className="font-medium text-[#3a3027]">Shopping</span>
            </div>
            <span className="text-sm font-medium text-[#3a3027]">$246.74/$600</span>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-bar good" style={{ width: "41.1%" }}></div>
          </div>
          <p className="text-xs text-[#3a3027] opacity-60 mt-1">41.1% of monthly budget used</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#fef2f2] flex items-center justify-center mr-3">
                <Car size={16} className="text-[#b91c1c]" />
              </div>
              <span className="font-medium text-[#3a3027]">Transportation</span>
            </div>
            <span className="text-sm font-medium text-[#3a3027]">$235.50/$300</span>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-bar warning" style={{ width: "78.5%" }}></div>
          </div>
          <p className="text-xs text-[#3a3027] opacity-60 mt-1">78.5% of monthly budget used</p>
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