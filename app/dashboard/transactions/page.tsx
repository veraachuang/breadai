export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">Transactions</h1>
      <div className="dashboard-card">
        <p className="text-[#3a3027] opacity-80 mb-6">
          View and manage all your transactions in one place. Filter by date, category, and amount to track your
          spending habits.
        </p>

        <div className="mt-6 border border-[#e6dfd5] rounded-lg p-6 flex items-center justify-center h-64 bg-[#f8f5f0]">
          <p className="text-[#3a3027] opacity-60">Transaction data will appear here</p>
        </div>
      </div>
    </div>
  )
}

