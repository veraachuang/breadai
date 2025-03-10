'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { api } from '@/app/_trpc/react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from './loading';

// const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
//   'Income': { bg: 'bg-green-100', text: 'text-green-800' },
//   'Food and Drink': { bg: 'bg-amber-100', text: 'text-amber-800' },
//   'Shopping': { bg: 'bg-blue-100', text: 'text-blue-800' },
//   'Transportation': { bg: 'bg-red-100', text: 'text-red-800' },
//   'Housing': { bg: 'bg-purple-100', text: 'text-purple-800' },
//   'Utilities': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
//   'Entertainment': { bg: 'bg-pink-100', text: 'text-pink-800' },
// };

export default function TransactionList() {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [startDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const { data: transactions, isLoading, error, refetch } = api.transaction.getAll.useQuery(
    {
      startDate,
      endDate,
    },
    {
      enabled: !!session?.user,
    }
  );

  useEffect(() => {
    if (transactions) {
      console.log('Current transactions:', transactions);
    }
  }, [transactions]);

  if (isLoading) {
    return <LoadingSpinner />;
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

  if (!transactions || transactions.length === 0) {
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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedTransactions = transactions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(transactions.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {displayedTransactions.length} of {transactions.length} transactions
        </div>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
        {displayedTransactions.map((transaction, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                  <span className="text-[#4d7c0f] text-lg">
                    {transaction.category[0]?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">{transaction.name}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${Math.abs(transaction.amount).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">{transaction.category[0]}</div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 