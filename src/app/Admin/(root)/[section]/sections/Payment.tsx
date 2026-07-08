'use client';

import React, { useEffect, useState } from 'react';
import { Receipt, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getTeacherPayments,
  type AdminPaymentRow,
} from '@/lib/api/teacher.service';

const naira = (v: number) =>
  `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(v || 0)}`;

const statusClass = (s: string) => {
  switch (s) {
    case 'completed':
    case 'paid':
      return 'text-green-700';
    case 'pending':
      return 'text-amber-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

/**
 * Staff payment view — read-only history only. No revenue totals / outstanding /
 * financial dashboard (that stays with the SuperAdmin).
 */
const Payment = () => {
  const [rows, setRows] = useState<AdminPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);
  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getTeacherPayments({ page, limit: 15, search: search || undefined });
        if (cancelled) return;
        if (res?.success && res.data) {
          setRows(res.data.payments || []);
          setTotalPages((res.data.pagination as any)?.totalPages || 1);
          setTotal((res.data.pagination as any)?.totalCount || 0);
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
  }, [page, search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">Payment history (read-only).</p>
      </div>

      {/* Light stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt size={16} className="text-green-600" />
            <span className="text-xs text-gray-500">Records</span>
          </div>
          {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold text-gray-900">{total}</p>}
        </div>
        <div className="bg-white rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt size={16} className="text-blue-600" />
            <span className="text-xs text-gray-500">Latest payment</span>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <p className="text-sm font-semibold text-gray-900">
              {rows[0]?.date ? new Date(rows[0].date).toLocaleDateString() : '—'}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search student or receipt"
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : errored ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Couldn&apos;t load payments.</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No payments found.</td></tr>
              ) : (
                rows.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.studentName}</p>
                      <p className="text-xs text-gray-500">{p.admissionNumber || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{naira(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                    <td className={`px-4 py-3 capitalize font-medium ${statusClass(p.status)}`}>{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !errored && rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
