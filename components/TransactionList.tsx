'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/_trpc/react';
import { format } from 'date-fns';
import type { Transaction } from '@prisma/client';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Income': { bg: 'bg-green-100', text: 'text-green-800' },
  'Food and Drink': { bg: 'bg-amber-100', text: 'text-amber-800' },
  'Shopping': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Transportation': { bg: 'bg-red-100', text: 'text-red-800' },
  'Housing': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Utilities': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Entertainment': { bg: 'bg-pink-100', text: 'text-pink-800' },
};

export function TransactionList() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Set to 30 days ago
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });

  const [displayCount, setDisplayCount] = useState(5);

  const { data: transactions, isLoading, error, refetch } = api.transaction.getAll.useQuery({
    startDate,
    endDate,
  }, {
    refetchOnWindowFocus: false
  });

  // Log transactions when they change
  useEffect(() => {
    if (transactions) {
      console.log("Transactions received:", {
        count: transactions.length,
        dateRange: { startDate, endDate },
        firstTransaction: transactions[0],
        lastTransaction: transactions[transactions.length - 1]
      });
    }
  }, [transactions, startDate, endDate]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const getCategoryStyle = (category: string[]) => {
    const mainCategory = category[0] || 'Other';
    return CATEGORY_COLORS[mainCategory] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  // Force a refetch when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse">Loading transactions...</div>
        <div className="text-sm text-gray-500 mt-2">
          Date range: {format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <div>Error loading transactions: {error.message}</div>
        <div className="text-sm mt-2">
          Date range: {format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}
        </div>
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-4">
        <div>No transactions found</div>
        <div className="text-sm text-gray-500 mt-2">
          Date range: {format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200"
        >
          Refresh Transactions
        </button>
      </div>
    );
  }

  const displayedTransactions = transactions.slice(0, displayCount);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {displayedTransactions.length} of {transactions.length} transactions
        </div>
        
      </div>
      
      <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
        {displayedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{transaction.name}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </p>
              {transaction.merchantName && (
                <p className="text-sm text-gray-500">{transaction.merchantName}</p>
              )}
              <div className="flex gap-2 mt-1">
                {transaction.category.map((cat, index) => {
                  const style = getCategoryStyle(transaction.category);
                  return (
                    <span
                      key={index}
                      className={`text-xs ${style.bg} ${style.text} rounded-full px-2 py-0.5`}
                    >
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className={`text-lg ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {transactions.length > displayCount && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-[#9c6644] text-white rounded-xl hover:bg-[#8b5a3b]"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
} 