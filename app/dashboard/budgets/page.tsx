export default function BudgetsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">Budget Management</h1>
      <div className="dashboard-card">
        <p className="text-[#3a3027] opacity-80 mb-6">
          Create and manage your budgets by category. Track your spending against your budget goals and receive
          notifications when you're approaching your limits.
        </p>

        <div className="mt-6 border border-[#e6dfd5] rounded-lg p-6 flex items-center justify-center h-64 bg-[#f8f5f0]">
          <p className="text-[#3a3027] opacity-60">Budget data will appear here</p>
        </div>
      </div>
    </div>
  )
}

