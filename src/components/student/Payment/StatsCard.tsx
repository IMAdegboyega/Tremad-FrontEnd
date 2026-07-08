'use client';

import React, { useMemo } from 'react';
import { CreditCard, DollarSign, FileText, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Payment } from '@/lib/api/student.service';
import { formatAmount } from '@/Constants/Payment';

interface StatsCardProps {
  payments: Payment[];
  isLoading: boolean;
}

/**
 * StatsCard (Payment)
 *
 * Derives totals from the real payment history. `paid` = sum of amounts
 * where status is "paid"; `outstanding` = sum of amounts that are still
 * pending or failed.
 */
const StatsCard: React.FC<StatsCardProps> = ({ payments, isLoading }) => {
  const totals = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const paid = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const outstanding = payments
      .filter((p) => p.status !== 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return { total, paid, outstanding, count: payments.length };
  }, [payments]);

  const stats = [
    {
      title: 'Total amount',
      value: payments.length ? formatAmount(totals.total) : '—',
      icon: <DollarSign size={20} />,
      iconBg: 'bg-green-50',
    },
    {
      title: 'Total amount paid',
      value: payments.length ? formatAmount(totals.paid) : '—',
      icon: <CreditCard size={20} />,
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Outstanding fees',
      value: payments.length ? formatAmount(totals.outstanding) : '—',
      icon: <FileText size={20} />,
      iconBg: 'bg-orange-50',
    },
    {
      title: 'Number of fees',
      value: payments.length ? totals.count : '—',
      icon: <Users size={20} />,
      iconBg: 'bg-purple-50',
    },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map((stat, index) => (
        <div
          key={index}
          className='bg-white rounded-xl p-5 border border-gray-100'
        >
          <div className='flex items-center justify-between mb-3'>
            <span className='text-sm text-gray-600'>{stat.title}</span>
            <div>
              <div className='text-gray-700'>{stat.icon}</div>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className='h-8 w-28' />
          ) : (
            <h2 className='text-2xl font-bold text-gray-900 mb-1'>
              {stat.value}
            </h2>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
