'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  ChevronRight,
  Circle,
  FileText,
  Megaphone,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatNotificationDate,
  groupNotifications,
  toUiNotification,
  type UiNotification,
} from '@/Constants/Notification';
import { getNotifications } from '@/lib/api/student.service';

/**
 * Map a UI notification type to a colored icon tile.
 */
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'project':
      return (
        <div className='w-full h-full bg-blue-500 rounded-lg flex items-center justify-center'>
          <FileText className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    case 'assignment':
      return (
        <div className='w-full h-full bg-orange-500 rounded-lg flex items-center justify-center'>
          <BookOpen className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    case 'grade':
    case 'success':
      return (
        <div className='w-full h-full bg-green-500 rounded-lg flex items-center justify-center'>
          <Trophy className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    case 'announcement':
      return (
        <div className='w-full h-full bg-purple-500 rounded-lg flex items-center justify-center'>
          <Megaphone className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
    default:
      return (
        <div className='w-full h-full bg-gray-500 rounded-lg flex items-center justify-center'>
          <Bell className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
        </div>
      );
  }
};

const NotificationItem = ({ notification }: { notification: UiNotification }) => (
  <div className='flex items-start gap-3 lg:gap-4 p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0'>
    <div className='w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0'>
      {getNotificationIcon(notification.type)}
    </div>

    <div className='flex-1 min-w-0'>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex-1'>
          <h3
            className={`text-sm lg:text-base ${
              !notification.read ? 'font-semibold' : 'font-medium'
            } text-gray-900 line-clamp-1`}
          >
            {notification.title}
          </h3>
          <p className='text-xs lg:text-sm text-gray-500 mt-0.5 line-clamp-2 lg:line-clamp-none'>
            {notification.description}
          </p>
        </div>
        {!notification.read && (
          <Circle className='w-2 h-2 fill-blue-500 text-blue-500 flex-shrink-0 mt-1.5' />
        )}
      </div>
      <p className='text-xs text-gray-400 mt-1'>
        {formatNotificationDate(notification.date)}
      </p>
    </div>

    <ChevronRight className='w-4 h-4 text-gray-400 flex-shrink-0 mt-1 hidden lg:block' />
  </div>
);

/**
 * Notifications page
 *
 * Fetches the full notification list from the backend and renders with
 * simple all/unread filters + date-grouped sections.
 */
const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
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

  const filteredNotifications = useMemo(
    () => (filter === 'unread' ? items.filter((n) => !n.read) : items),
    [items, filter]
  );

  const grouped = useMemo(
    () => groupNotifications(filteredNotifications),
    [filteredNotifications]
  );

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='bg-white rounded-xl lg:rounded-2xl shadow-sm mb-4 lg:mb-6'>
        <div className='p-4 lg:p-6'>
          <div className='flex items-center justify-between mb-4 lg:mb-6'>
            <h1 className='text-xl lg:text-2xl font-semibold text-gray-900'>
              Notifications
            </h1>
            <Link
              href='/notifications/settings'
              className='text-sm lg:text-base text-green-700 hover:text-green-800 font-medium'
            >
              Settings
            </Link>
          </div>

          <div className='flex gap-4 lg:gap-6 border-b border-gray-200'>
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 text-sm lg:text-base font-medium transition-colors relative ${
                filter === 'all'
                  ? 'text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Notifications
              {filter === 'all' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-green-700' />
              )}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-3 text-sm lg:text-base font-medium transition-colors relative ${
                filter === 'unread'
                  ? 'text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
              {filter === 'unread' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-green-700' />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl lg:rounded-2xl shadow-sm overflow-hidden'>
        {loading ? (
          <div className='p-6 space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-start gap-3'>
                <Skeleton className='h-10 w-10 rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-2/3' />
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-1/3' />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className='p-8 lg:p-12 text-center'>
            <Bell className='w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 text-sm lg:text-base'>
              No notifications to display
            </p>
          </div>
        ) : (
          <div>
            {grouped.today.length > 0 && filter === 'all' && (
              <div>
                <div className='px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200'>
                  <h2 className='text-xs lg:text-sm font-medium text-gray-600'>
                    Today
                  </h2>
                </div>
                {grouped.today.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}

            {grouped.yesterday.length > 0 && filter === 'all' && (
              <div>
                <div className='px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200'>
                  <h2 className='text-xs lg:text-sm font-medium text-gray-600'>
                    Yesterday
                  </h2>
                </div>
                {grouped.yesterday.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}

            {grouped.older.length > 0 && filter === 'all' && (
              <div>
                <div className='px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200'>
                  <h2 className='text-xs lg:text-sm font-medium text-gray-600'>
                    Older
                  </h2>
                </div>
                {grouped.older.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}

            {filter === 'unread' &&
              filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
