'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, CircleAlert, CircleCheck, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getStaffNotifications,
  markAllStaffNotificationsRead,
  markStaffNotificationRead,
  type StaffNotification,
} from '@/lib/api/teacher.service';
import { getApiErrorMessage } from '@/lib/api/client';

/**
 * Staff notifications — the real feed.
 *
 * Approvals already wrote Notifications addressed to the requesting teacher
 * (approve/deny on every request they submit); nothing ever read them back, so
 * this screen used to hardcode "You're all caught up".
 */
const Notification = () => {
  const [items, setItems] = useState<StaffNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await getStaffNotifications({ limit: 50 });
      if (res?.success && res.data) {
        setItems(res.data.notifications || []);
        setUnread(res.data.unreadCount || 0);
      } else {
        setError(res?.message || 'Could not load your notifications.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your notifications.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openOne = async (n: StaffNotification) => {
    if (n.isRead) return;
    // Optimistic — a failed read-receipt isn't worth blocking the UI over.
    setItems((prev) =>
      prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i))
    );
    setUnread((u) => Math.max(0, u - 1));
    try {
      await markStaffNotificationRead(n.id);
    } catch {
      /* soft */
    }
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await markAllStaffNotificationsRead();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnread(0);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not mark them as read.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-xs align-middle bg-green-700 text-white rounded-full px-2 py-0.5">
                {unread} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500">Updates on your requests and schedule.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            disabled={busy}
            className="flex items-center gap-1.5 text-sm font-medium text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 disabled:opacity-50"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm">
          <Bell size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50 overflow-hidden">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => openOne(n)}
              className={`w-full text-left flex gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                n.isRead ? '' : 'bg-green-50/40'
              }`}
            >
              <Icon priority={n.priority} type={n.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${n.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Icon = ({ priority, type }: { priority: string; type: string }) => {
  const base = 'w-9 h-9 rounded-lg flex items-center justify-center shrink-0';
  if (priority === 'high') {
    return (
      <div className={`${base} bg-red-100`}>
        <CircleAlert size={17} className="text-red-600" />
      </div>
    );
  }
  if (type === 'approval') {
    return (
      <div className={`${base} bg-green-100`}>
        <CircleCheck size={17} className="text-green-700" />
      </div>
    );
  }
  return (
    <div className={`${base} bg-blue-100`}>
      <Info size={17} className="text-blue-600" />
    </div>
  );
};

/** "3 hours ago" / "12 Jun" once it's more than a week old. */
const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default Notification;
