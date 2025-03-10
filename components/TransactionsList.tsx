import { useState } from 'react';
import { format } from 'date-fns';
import {
  DollarSign,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  Store,
} from 'lucide-react';
import { api } from '@/utils/api';

export default function TransactionsList() {
  const [timeframe, setTimeframe] = useState('30d'); // '7d', '30d', '90d'

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    start.setDate(start.getDate() - days);
    return { start, end };
  };

  const { start, end } = getDateRange();
  const { data: transactions, isLoading } = api.transaction.getAll.useQuery({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary"></div>
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-8">
        <DollarSign size={40} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
        <p className="text-gray-600 mt-2">
          Link your bank account to start tracking your transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <Store size={16} className="text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">
                    {transaction.name}
                  </h3>
                </div>
                <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Tag size={12} className="mr-1" />
                    {transaction.aiCategory || transaction.category[0] || 'Uncategorized'}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`text-sm font-medium ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {transaction.amount < 0 ? (
                    <ChevronDown size={16} className="inline mr-1" />
                  ) : (
                    <ChevronUp size={16} className="inline mr-1" />
                  )}
                  {formatAmount(Math.abs(transaction.amount))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 