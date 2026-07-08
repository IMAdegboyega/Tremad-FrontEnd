'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getDashboardOverview,
  type DashboardOverview,
} from '@/lib/api/superAdmin.service';

interface StatCardConfig {
  key: keyof Omit<DashboardOverview, 'generated_at'>;
  title: string;
  icon: string;
  /** Where the card navigates when clicked. */
  href: string;
  /** Format the raw value for display (e.g. comma separator vs currency). */
  format: (value: number) => string;
}

// Static visual config; the dynamic numbers come from the API.
const STAT_CARDS_CONFIG: StatCardConfig[] = [
  {
    key: 'totalStudents',
    title: 'Total student',
    icon: '/icon/TotalStudent.svg',
    href: '/SuperAdmin/student-management',
    format: (v) => new Intl.NumberFormat('en-NG').format(v),
  },
  {
    key: 'activeTeachers',
    title: 'Active teachers',
    icon: '/icon/ActiveTeachers.svg',
    href: '/SuperAdmin/staff-management',
    format: (v) => new Intl.NumberFormat('en-NG').format(v),
  },
  {
    key: 'monthlyRevenue',
    title: 'Monthly revenue',
    icon: '/icon/MonthlyRevenue.svg',
    href: '/SuperAdmin/payment-management',
    // Naira symbol + thousands separator. We round to whole nairas because the
    // backend stores amounts as integers.
    format: (v) =>
      `₦${new Intl.NumberFormat('en-NG', {
        maximumFractionDigits: 0,
      }).format(v)}`,
  },
  {
    key: 'pendingApprovals',
    title: 'Pending approvals',
    icon: '/icon/PendingApprovals.svg',
    href: '/SuperAdmin/approvals',
    format: (v) => new Intl.NumberFormat('en-NG').format(v),
  },
];

/**
 * SuperAdmin headline numbers grid.
 *
 * Pulls totals + month-over-month deltas from /super-admin/analytics/overview.
 * Renders Skeleton placeholders during the initial fetch and a soft empty state
 * if the request fails — we never want stale mock numbers misleading admins.
 */
const StatsCards = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getDashboardOverview();
        if (cancelled) return;
        if (res?.success && res.data) {
          setOverview(res.data);
          setErrored(false);
        } else {
          setErrored(true);
        }
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {STAT_CARDS_CONFIG.map((config) => {
        const stat = overview?.[config.key];
        const value = stat?.value ?? 0;
        const changeValue = stat?.changePercent ?? 0;
        const isPositive = changeValue >= 0;

        return (
          <Link
            href={config.href}
            key={config.title}
            className='block bg-white rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer'
          >
            {/* Header with icon and title */}
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm text-gray-600'>{config.title}</p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg flex items-center justify-center'>
                  <Image
                    src={config.icon}
                    alt={config.title}
                    width={30}
                    height={30}
                    className='w-8 h-8'
                  />
                </div>
              </div>
            </div>

            {/* Value */}
            {loading ? (
              <Skeleton className='h-7 w-24 mb-2' />
            ) : (
              <p className='text-2xl font-bold text-gray-900 mb-2'>
                {errored ? '—' : config.format(value)}
              </p>
            )}

            {/* Change indicator */}
            {loading ? (
              <Skeleton className='h-4 w-32' />
            ) : errored ? (
              <span className='text-sm text-gray-400'>
                Couldn&apos;t load stats
              </span>
            ) : (
              <div className='flex items-center gap-1.5'>
                {isPositive ? (
                  <TrendingUp className='w-4 h-4 text-green-500' />
                ) : (
                  <TrendingDown className='w-4 h-4 text-red-500' />
                )}
                <span
                  className={`text-sm font-medium ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {changeValue}%
                </span>
                <span className='text-sm text-gray-500'>from last month</span>
                <span className='ml-auto'>
                  <MoveRight
                    size={20}
                    className='text-green-800 cursor-pointer'
                  />
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default StatsCards;
