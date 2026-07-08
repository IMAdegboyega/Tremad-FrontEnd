'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clock, LogIn, LogOut, Timer, Monitor, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getUserSessions,
  type UserSessionsResponse,
} from '@/lib/api/superAdmin.service';
import {
  deviceLabel,
  fmtDateTime,
  fmtRelative,
  roleBadgeClass,
  roleLabel,
} from './format';

interface Props {
  userId: string | null;
  fallbackName?: string;
  onClose: () => void;
}

/** Colour + label for a session's end reason / live status. */
const statusChip = (status: string, isOnline: boolean) => {
  if (isOnline)
    return { label: 'Active now', cls: 'bg-green-100 text-green-700' };
  switch (status) {
    case 'logout':
      return { label: 'Logged out', cls: 'bg-gray-100 text-gray-600' };
    case 'expired':
      return { label: 'Expired', cls: 'bg-amber-100 text-amber-700' };
    case 'forced':
      return { label: 'Force-logout', cls: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Ended', cls: 'bg-gray-100 text-gray-600' };
  }
};

/**
 * Drill-down modal: a single user's login timeline plus a rolled-up summary
 * (total sessions, total & longest time online, devices used). Fetches lazily
 * whenever `userId` becomes non-null.
 */
const UserSessionsDialog = ({ userId, fallbackName, onClose }: Props) => {
  const [data, setData] = useState<UserSessionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!userId) return;
    cancelled.current = false;
    setData(null);
    setErrored(false);
    setLoading(true);
    (async () => {
      try {
        const res = await getUserSessions(userId, { dateRange: 90, limit: 100 });
        if (cancelled.current) return;
        if (res?.success && res.data) {
          setData(res.data);
        } else {
          setErrored(true);
        }
      } catch {
        if (!cancelled.current) setErrored(true);
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    })();
    return () => {
      cancelled.current = true;
    };
  }, [userId]);

  const summary = data?.summary;
  const sessions = data?.sessions ?? [];

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0'>
        <DialogHeader className='px-5 pt-5 pb-3 border-b border-gray-100'>
          <DialogTitle className='flex items-center gap-2'>
            <span>{data?.user?.name || fallbackName || 'User'} — login history</span>
            {data?.user?.role && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass(
                  data.user.role
                )}`}
              >
                {roleLabel(data.user.role)}
              </span>
            )}
          </DialogTitle>
          {data?.user?.email && (
            <p className='text-sm text-gray-500'>{data.user.email}</p>
          )}
        </DialogHeader>

        <div className='overflow-y-auto px-5 py-4'>
          {/* Summary cards */}
          {loading ? (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5'>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-16 rounded-lg' />
              ))}
            </div>
          ) : errored ? (
            <p className='text-sm text-gray-400 py-8 text-center'>
              Couldn&apos;t load this user&apos;s sessions.
            </p>
          ) : (
            <>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5'>
                <StatBox
                  icon={<LogIn size={15} className='text-blue-600' />}
                  label='Total logins'
                  value={String(summary?.totalSessions ?? 0)}
                />
                <StatBox
                  icon={<Clock size={15} className='text-green-600' />}
                  label='Total time'
                  value={summary?.totalTimeHuman ?? '0s'}
                />
                <StatBox
                  icon={<Timer size={15} className='text-purple-600' />}
                  label='Avg session'
                  value={summary?.avgSessionHuman ?? '0s'}
                />
                <StatBox
                  icon={<Timer size={15} className='text-amber-600' />}
                  label='Longest'
                  value={summary?.longestSessionHuman ?? '0s'}
                />
              </div>

              {/* Timeline */}
              <h3 className='text-sm font-semibold text-gray-700 mb-2'>
                Sessions (last 90 days)
              </h3>
              {sessions.length === 0 ? (
                <p className='text-sm text-gray-400 py-6 text-center'>
                  No sessions recorded in this period.
                </p>
              ) : (
                <ol className='relative border-l border-gray-200 ml-1.5'>
                  {sessions.map((s) => {
                    const chip = statusChip(s.status, s.isOnline);
                    return (
                      <li key={s.sessionId} className='mb-4 ml-4'>
                        <span
                          className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white ${
                            s.isOnline ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <div className='flex items-center justify-between gap-2 flex-wrap'>
                          <span className='text-sm font-medium text-gray-900'>
                            {fmtDateTime(s.loginAt)}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${chip.cls}`}
                          >
                            {chip.label}
                          </span>
                        </div>
                        <div className='mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500'>
                          <span className='flex items-center gap-1'>
                            <Timer size={12} /> {s.durationHuman}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Monitor size={12} /> {deviceLabel(s.device)}
                          </span>
                          {s.ip && (
                            <span className='flex items-center gap-1'>
                              <MapPin size={12} /> {s.ip}
                            </span>
                          )}
                          {!s.isOnline && s.endedAt && (
                            <span className='flex items-center gap-1'>
                              <LogOut size={12} /> ended {fmtRelative(s.endedAt)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatBox = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className='bg-gray-50 rounded-lg p-3'>
    <div className='flex items-center gap-1.5 mb-1'>
      {icon}
      <span className='text-xs text-gray-500'>{label}</span>
    </div>
    <p className='text-base font-bold text-gray-900'>{value}</p>
  </div>
);

export default UserSessionsDialog;
