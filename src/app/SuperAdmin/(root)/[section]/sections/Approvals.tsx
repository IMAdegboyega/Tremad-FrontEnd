'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X, Inbox, FileText, CalendarClock, UserMinus, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getPendingApprovals,
  approveRequest,
  denyRequest,
  type PendingApproval,
} from '@/lib/api/superAdmin.service';

/** Backend populates requestedBy with name fields the base type omits. */
type Requester = PendingApproval['requestedBy'] & {
  firstName?: string;
  lastName?: string;
};

const REQUEST_META: Record<
  string,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  user_creation: {
    label: 'Student creation',
    icon: <UserPlus size={16} />,
    cls: 'bg-emerald-100 text-emerald-700',
  },
  result_upload: {
    label: 'Result upload',
    icon: <FileText size={16} />,
    cls: 'bg-blue-100 text-blue-700',
  },
  timetable_change: {
    label: 'Timetable change',
    icon: <CalendarClock size={16} />,
    cls: 'bg-purple-100 text-purple-700',
  },
  student_removal: {
    label: 'Student removal',
    icon: <UserMinus size={16} />,
    cls: 'bg-red-100 text-red-700',
  },
};

const metaFor = (type: string) =>
  REQUEST_META[type] || {
    label: type,
    icon: <FileText size={16} />,
    cls: 'bg-gray-100 text-gray-600',
  };

const requesterName = (r?: Requester) => {
  if (!r) return 'Unknown';
  const name = `${r.firstName || ''} ${r.lastName || ''}`.trim();
  return name || r.email || 'Unknown';
};

/** Short human-readable gist of the request payload. */
const summarize = (data: unknown): string => {
  if (!data || typeof data !== 'object') return '';
  const d = data as Record<string, any>;

  // Student creation request → name + class.
  if (d.firstName || d.lastName) {
    const name = `${d.firstName || ''} ${d.lastName || ''}`.trim();
    return [name, d.className].filter(Boolean).join(' · ');
  }

  // Structured timetable request → action + subject/class.
  if (d.action && (d.entry || d.timetableId)) {
    const e = d.entry || {};
    return [d.action, e.subject, e.className || e.day].filter(Boolean).join(' · ');
  }

  const keys = ['reason', 'changeType', 'subject', 'studentName', 'className'];
  const parts = keys
    .filter((k) => d[k])
    .map((k) => `${k}: ${String(d[k])}`);
  return parts.slice(0, 3).join(' · ');
};

/**
 * SuperAdmin Approvals inbox.
 *
 * Lists pending staff requests (result uploads, timetable changes, student
 * removals) and lets the SA approve or decline each. Declining requires a
 * reason. Destination of the Home "Pending approvals" stat card.
 */
const Approvals = () => {
  const [items, setItems] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  // Decline reason modal
  const [declineTarget, setDeclineTarget] = useState<PendingApproval | null>(
    null
  );
  const [reason, setReason] = useState('');

  const cancelled = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingApprovals();
      if (cancelled.current) return;
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data);
        setErrored(false);
      } else {
        setErrored(true);
      }
    } catch {
      if (!cancelled.current) setErrored(true);
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelled.current = false;
    load();
    return () => {
      cancelled.current = true;
    };
  }, [load]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await approveRequest(id);
      await load();
    } catch {
      // leave list; reload reflects reality next time
    } finally {
      setActingId(null);
    }
  };

  const confirmDecline = async () => {
    if (!declineTarget) return;
    setActingId(declineTarget._id);
    try {
      await denyRequest(declineTarget._id, reason.trim() || 'No reason given');
      setDeclineTarget(null);
      setReason('');
      await load();
    } catch {
      // keep modal open on failure
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
          Approvals
        </h1>
        <p className='text-sm text-gray-500'>
          Review and act on requests submitted by staff.
        </p>
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className='h-24 w-full rounded-xl' />
          ))}
        </div>
      ) : errored ? (
        <div className='bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm'>
          Couldn&apos;t load approvals.
        </div>
      ) : items.length === 0 ? (
        <div className='bg-white rounded-xl p-10 text-center shadow-sm'>
          <Inbox size={32} className='mx-auto text-gray-300 mb-2' />
          <p className='text-gray-500'>No pending requests. You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {items.map((item) => {
            const meta = metaFor(item.requestType);
            const busy = actingId === item._id;
            return (
              <div
                key={item._id}
                className='bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3'
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${meta.cls}`}
                    >
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className='text-xs text-gray-400'>
                      {formatDistanceToNow(new Date(item.createdAt))} ago
                    </span>
                  </div>
                  <p className='text-sm font-medium text-gray-900'>
                    {requesterName(item.requestedBy as Requester)}
                    <span className='text-gray-400 font-normal'>
                      {' '}
                      ({(item.requestedBy as Requester)?.role || 'staff'})
                    </span>
                  </p>
                  {summarize(item.data) && (
                    <p className='text-xs text-gray-500 truncate mt-0.5'>
                      {summarize(item.data)}
                    </p>
                  )}
                </div>

                <div className='flex items-center gap-2 shrink-0'>
                  <button
                    onClick={() => handleApprove(item._id)}
                    disabled={busy}
                    className='flex items-center gap-1.5 text-sm font-medium bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50'
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    onClick={() => {
                      setDeclineTarget(item);
                      setReason('');
                    }}
                    disabled={busy}
                    className='flex items-center gap-1.5 text-sm font-medium border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50'
                  >
                    <X size={15} /> Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline reason modal */}
      <Dialog
        open={!!declineTarget}
        onOpenChange={(o) => !o && setDeclineTarget(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Decline request</DialogTitle>
          </DialogHeader>
          <div className='py-1'>
            <label className='text-xs text-gray-500 mb-1 block'>
              Reason (shown to the requester)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder='Why is this being declined?'
              className='w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30'
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setDeclineTarget(null)}
              className='text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={confirmDecline}
              disabled={actingId === declineTarget?._id}
              className='text-sm px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
            >
              {actingId === declineTarget?._id ? 'Declining…' : 'Decline'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
