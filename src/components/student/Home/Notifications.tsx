'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  FileText,
  Megaphone,
  Trophy,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatNotificationDate,
  toUiNotification,
  type UiNotification,
} from '@/Constants/Notification';
import { getNotifications } from '@/lib/api/student.service';

/**
 * Inline icon tile used in the compact notification row.
 */
const iconFor = (type: string) => {
  switch (type) {
    case 'project':
      return (
        <div className='w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
          <FileText className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    case 'assignment':
      return (
        <div className='w-8 h-8 lg:w-10 lg:h-10 bg-orange-500 rounded-lg flex items-center justify-center'>
          <BookOpen className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    case 'grade':
    case 'success':
      return (
        <div className='w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center'>
          <Trophy className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    case 'announcement':
      return (
        <div className='w-8 h-8 lg:w-10 lg:h-10 bg-purple-500 rounded-lg flex items-center justify-center'>
          <Megaphone className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    default:
      return (
        <div className='w-8 h-8 lg:w-10 lg:h-10 bg-gray-500 rounded-lg flex items-center justify-center'>
          <Bell className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
  }
};

/**
 * Home Notifications widget
 *
 * Shows the three most recent notifications for the student. Falls back to
 * a compact empty state when there are none, and renders skeletons while the
 * fetch is in flight.
 */
const Notifications = () => {
  const [items, setItems] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNotifications()
      .then((res) => {
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setItems(res.data.map(toUiNotification));
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = items.slice(0, 3);

  return (
    <div className='bg-white rounded-xl lg:rounded-2xl space-y-2 p-4 h-full'>
      <div className='flex items-center justify-between mb-3 lg:mb-4'>
        <h2 className='text-base lg:text-lg font-semibold text-gray-900'>
          Notifications
        </h2>
        <span className='text-xs lg:text-sm text-green-700 hover:text-green-900 cursor-pointer font-medium'>
          See all
        </span>
      </div>

      {loading ? (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg'
            >
              <Skeleton className='h-8 w-8 lg:h-10 lg:w-10 rounded-lg' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-3 w-2/3' />
                <Skeleton className='h-3 w-full' />
              </div>
            </div>
          ))}
        </div>
      ) : preview.length === 0 ? (
        <div className='flex flex-col items-center text-center py-6'>
          <Bell className='w-8 h-8 text-gray-300 mb-2' />
          <p className='text-sm text-gray-500'>No notifications yet</p>
        </div>
      ) : (
        <div className='space-y-2 lg:space-y-3'>
          {preview.map((notification) => (
            <div
              key={notification.id}
              className='flex items-start gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
            >
              {iconFor(notification.type)}

              <div className='flex-1 min-w-0'>
                <p
                  className={`text-xs lg:text-sm ${
                    notification.read ? 'font-medium' : 'font-semibold'
                  } text-gray-900 line-clamp-1`}
                >
                  {notification.title}
                </p>
                <p className='text-xs text-gray-500 mt-0.5 line-clamp-2'>
                  {notification.description}
                </p>
                <p className='text-[10px] lg:text-xs text-gray-400 mt-1'>
                  {formatNotificationDate(notification.date)}
                </p>
              </div>

              <svg
                className='w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0 mt-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
