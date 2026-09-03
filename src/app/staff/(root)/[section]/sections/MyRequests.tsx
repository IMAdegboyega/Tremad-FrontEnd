'use client';

import React, { useEffect, useState } from 'react';
import { FileText, CalendarClock, UserPlus, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyRequests, type MyRequest } from '@/lib/api/teacher.service';

const META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  user_creation: { label: 'Student creation', icon: <UserPlus size={15} />, cls: 'bg-blue-100 text-blue-700' },
  timetable_change: { label: 'Timetable change', icon: <CalendarClock size={15} />, cls: 'bg-purple-100 text-purple-700' },
  result_upload: { label: 'Result upload', icon: <FileText size={15} />, cls: 'bg-emerald-100 text-emerald-700' },
  student_removal: { label: 'Student removal', icon: <FileText size={15} />, cls: 'bg-red-100 text-red-700' },
};

const statusChip = (s: string) => {
  switch (s) {
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
};

const MyRequests = () => {
  const [items, setItems] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMyRequests({ limit: 50 });
        if (cancelled) return;
        if (res?.success && res.data) {
          setItems(res.data.requests || []);
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
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Requests</h1>
        <p className="text-sm text-gray-500">Requests you&apos;ve submitted and their status.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : errored ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">Couldn&apos;t load your requests.</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm">
          <Inbox size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">You haven&apos;t submitted any requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const meta = META[r.requestType] || { label: r.requestType, icon: <FileText size={15} />, cls: 'bg-gray-100 text-gray-600' };
            return (
              <div key={r._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${meta.cls}`}>
                      {meta.icon}{meta.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(r.createdAt))} ago</span>
                  </div>
                  {r.metadata?.summary && <p className="text-sm text-gray-700 truncate">{r.metadata.summary}</p>}
                  {r.status === 'rejected' && r.rejectionReason && (
                    <p className="text-xs text-red-600 mt-0.5">Reason: {r.rejectionReason}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusChip(r.status)}`}>{r.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
