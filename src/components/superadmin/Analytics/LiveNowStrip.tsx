'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Radio, Monitor, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getLiveSessions,
  type LiveSessionsResponse,
} from '@/lib/api/superAdmin.service';
import { deviceLabel, fmtRelative, roleBadgeClass, roleLabel } from './format';

const REFRESH_MS = 30_000;

/**
 * "Who's online right now" strip.
 *
 * Two summary tiles (online users / active sessions) plus a live list of the
 * currently-connected sessions. Auto-refreshes every 30s so a SuperAdmin can
 * leave it open and watch activity in near-real-time.
 */
const LiveNowStrip = () => {
  const [data, setData] = useState<LiveSessionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const cancelled = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await getLiveSessions();
      if (cancelled.current) return;
      if (res?.success && res.data) {
        setData(res.data);
        setErrored(false);
      } else {
        setErrored(true);
      }
    } catch {
      if (!cancelled.current) setErrored(true);
    } finally {
      if (!cancelled.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelled.current = false;
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => {
      cancelled.current = true;
      clearInterval(id);
    };
  }, [load]);

  const sessions = data?.sessions ?? [];

  return (
    <div className='bg-white rounded-xl p-4 lg:p-5 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <span className='relative flex h-2.5 w-2.5'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' />
            <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500' />
          </span>
          <h2 className='text-base font-semibold text-gray-900'>Live now</h2>
        </div>
        <button
          onClick={() => load(true)}
          className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors'
          aria-label='Refresh live sessions'
        >
          <RefreshCw
            size={15}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Summary tiles */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        <SummaryTile
          icon={<Users size={18} className='text-green-600' />}
          label='Online users'
          value={loading ? null : errored ? '—' : String(data?.onlineUsers ?? 0)}
        />
        <SummaryTile
          icon={<Radio size={18} className='text-blue-600' />}
          label='Active sessions'
          value={
            loading ? null : errored ? '—' : String(data?.activeSessions ?? 0)
          }
        />
      </div>

      {/* Online list */}
      {loading ? (
        <div className='space-y-2'>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className='h-12 w-full rounded-lg' />
          ))}
        </div>
      ) : errored ? (
        <p className='text-sm text-gray-400 py-6 text-center'>
          Couldn&apos;t load live sessions.
        </p>
      ) : sessions.length === 0 ? (
        <p className='text-sm text-gray-400 py-6 text-center'>
          Nobody is online right now.
        </p>
      ) : (
        <div className='space-y-1.5 max-h-72 overflow-y-auto'>
          {sessions.map((s) => (
            <div
              key={s.sessionId}
              className='flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-gray-50'
            >
              <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0'>
                {s.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {s.name}
                  </p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleBadgeClass(
                      s.role
                    )}`}
                  >
                    {roleLabel(s.role)}
                  </span>
                </div>
                <p className='text-xs text-gray-500 flex items-center gap-1 truncate'>
                  <Monitor size={11} /> {deviceLabel(s.device)}
                </p>
              </div>
              <div className='text-right shrink-0'>
                <p className='text-xs font-medium text-green-600'>
                  {s.onlineForHuman} online
                </p>
                <p className='text-[11px] text-gray-400'>
                  active {fmtRelative(s.lastActivity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SummaryTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) => (
  <div className='bg-gray-50 rounded-lg p-3'>
    <div className='flex items-center gap-2 mb-1'>
      {icon}
      <span className='text-xs text-gray-500'>{label}</span>
    </div>
    {value === null ? (
      <Skeleton className='h-6 w-10' />
    ) : (
      <p className='text-xl font-bold text-gray-900'>{value}</p>
    )}
  </div>
);

export default LiveNowStrip;
