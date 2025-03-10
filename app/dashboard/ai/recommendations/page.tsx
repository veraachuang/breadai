export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#3a3027] mb-6">Smart Recommendations</h1>
      <div className="dashboard-card">
        <p className="text-[#3a3027] opacity-80 mb-6">
          Receive personalized financial recommendations from BreadAI. Our AI analyzes your spending habits, income, and
          financial goals to provide tailored suggestions for college students.
        </p>

        <div className="mt-6 space-y-4">
          <div className="recommendation-card">
            <h3 className="recommendation-title">Optimize Your Coffee Budget</h3>
            <p className="recommendation-content">
              You&apos;re spending $15/week at premium coffee shops. Making coffee at home 3 days a week could save you $78
              this month.
            </p>
            <button className="recommendation-action">Apply this suggestion</button>
          </div>

          <div className="recommendation-card">
            <h3 className="recommendation-title">Subscription Overlap Detected</h3>
            <p className="recommendation-content">
              You&apos;re paying for both Netflix ($14.99) and Hulu ($11.99) with similar content. Consider consolidating to
              save $11.99 monthly.
            </p>
          </div>

          <div className="recommendation-card">
            <h3 className="recommendation-title">Emergency Fund Opportunity</h3>
            <p className="recommendation-content">
              Based on your income and spending patterns, you could allocate an additional $250/month to your emergency
              fund without impacting your lifestyle.
            </p>
            <button className="recommendation-action">Adjust budget</button>
          </div>
        </div>
      </div>
    </div>
  )
}

