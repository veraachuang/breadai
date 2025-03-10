'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/_trpc/react';
import { format } from 'date-fns';

export function TransactionList() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString();
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString());

  const { data: transactions, isLoading, error } = api.transaction.getAll.useQuery({
    startDate,
    endDate,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error loading transactions: {error.message}</div>;
  }

  if (!transactions?.length) {
    return <div className="text-center py-4">No transactions found</div>;
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
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
              {transaction.category.map((cat, index) => (
                <span
                  key={index}
                  className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className={`text-lg ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
} 