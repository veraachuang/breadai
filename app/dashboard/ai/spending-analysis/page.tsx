export default function SpendingAnalysisPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">AI Spending Analysis</h1>
      <div className="dashboard-card">
        <p className="text-[#3a3027] opacity-80 mb-6">
          Get AI-powered insights into your spending patterns. BreadAI analyzes your transactions to identify trends,
          anomalies, and opportunities for savings.
        </p>

        <div className="mt-6 border border-[#e6dfd5] rounded-lg p-6 flex items-center justify-center h-64 bg-[#f8f5f0]">
          <p className="text-[#3a3027] opacity-60">AI spending analysis will appear here</p>
        </div>

        <div className="mt-6">
          <div className="recommendation-card">
            <h3 className="recommendation-title">Spending Pattern Detected</h3>
            <p className="recommendation-content">
              Our AI has detected that your restaurant spending has increased by 32% compared to last month. Would you
              like to create a specialized budget for dining out?
            </p>
            <button className="recommendation-action">Create budget</button>
          </div>
        </div>
      </div>
    </div>
  )
}

