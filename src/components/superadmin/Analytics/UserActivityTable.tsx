'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getUserActivity,
  type UserActivityRow,
  type UserActivitySortField,
} from '@/lib/api/superAdmin.service';
import { fmtRelative, roleBadgeClass, roleLabel } from './format';

type Order = 'asc' | 'desc';

const DATE_RANGES = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

const ROLE_FILTERS = [
  { label: 'All roles', value: '' },
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Staff', value: 'admin' },
  { label: 'Student', value: 'student' },
];

interface Column {
  key: string;
  label: string;
  sortable?: UserActivitySortField;
  align?: 'left' | 'right' | 'center';
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'User', sortable: 'name' },
  { key: 'role', label: 'Role' },
  { key: 'loginCount', label: 'Logins', sortable: 'loginCount', align: 'right' },
  { key: 'lastLogin', label: 'Last login', sortable: 'lastLogin' },
  { key: 'totalTime', label: 'Total time', sortable: 'totalTime', align: 'right' },
  { key: 'avgSession', label: 'Avg session', sortable: 'avgSession', align: 'right' },
  { key: 'status', label: 'Status', align: 'center' },
];

interface Props {
  onSelectUser: (userId: string, name: string) => void;
}

/**
 * The headline "who logged in" table. Sortable, searchable, filterable by role
 * / date-range / online-only, paginated. Each row drills into the user's login
 * timeline via `onSelectUser`.
 */
const UserActivityTable = ({ onSelectUser }: Props) => {
  const [rows, setRows] = useState<UserActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState<UserActivitySortField>('lastLogin');
  const [order, setOrder] = useState<Order>('desc');
  const [dateRange, setDateRange] = useState(30);
  const [role, setRole] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const cancelled = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserActivity({
        page,
        limit: 20,
        sortBy,
        order,
        dateRange,
        role: role || undefined,
        search: search || undefined,
        onlineOnly: onlineOnly || undefined,
      });
      if (cancelled.current) return;
      if (res?.success && res.data) {
        setRows(res.data.users);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotal(res.data.pagination.total || 0);
        setErrored(false);
      } else {
        setErrored(true);
      }
    } catch {
      if (!cancelled.current) setErrored(true);
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [page, sortBy, order, dateRange, role, search, onlineOnly]);

  useEffect(() => {
    cancelled.current = false;
    load();
    return () => {
      cancelled.current = true;
    };
  }, [load]);

  // Any filter change resets to page 1.
  useEffect(() => {
    setPage(1);
  }, [sortBy, order, dateRange, role, search, onlineOnly]);

  const toggleSort = (field?: UserActivitySortField) => {
    if (!field) return;
    if (sortBy === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const sortIcon = (field?: UserActivitySortField) => {
    if (!field) return null;
    if (sortBy !== field)
      return <ArrowUpDown size={13} className='text-gray-300' />;
    return order === 'asc' ? (
      <ArrowUp size={13} className='text-gray-700' />
    ) : (
      <ArrowDown size={13} className='text-gray-700' />
    );
  };

  return (
    <div className='bg-white rounded-xl shadow-sm'>
      {/* Header + controls */}
      <div className='p-4 lg:p-5 border-b border-gray-100'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
          <div>
            <h2 className='text-base font-semibold text-gray-900'>
              User login activity
            </h2>
            <p className='text-sm text-gray-500'>
              {loading ? 'Loading…' : `${total} user${total === 1 ? '' : 's'}`}
              {' active in the selected period'}
            </p>
          </div>
          <div className='relative'>
            <Search
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Search name or email'
              className='pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500'
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className='flex flex-wrap items-center gap-2'>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className='text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30'
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className='text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30'
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOnlineOnly((v) => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              onlineOnly
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Online only
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-gray-500 border-b border-gray-100'>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.sortable)}
                      className={`inline-flex items-center gap-1 hover:text-gray-800 ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {col.label}
                      {sortIcon(col.sortable)}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className='border-b border-gray-50'>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className='px-4 py-3'>
                      <Skeleton className='h-4 w-full max-w-[120px]' />
                    </td>
                  ))}
                </tr>
              ))
            ) : errored ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className='px-4 py-10 text-center text-gray-400'
                >
                  Couldn&apos;t load activity data.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className='px-4 py-10 text-center text-gray-400'
                >
                  No logins found for these filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.userId}
                  onClick={() => onSelectUser(r.userId, r.name)}
                  className='border-b border-gray-50 hover:bg-gray-50 cursor-pointer'
                >
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2.5'>
                      <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0'>
                        {r.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className='min-w-0'>
                        <p className='font-medium text-gray-900 truncate max-w-[180px]'>
                          {r.name || 'Unknown'}
                        </p>
                        <p className='text-xs text-gray-500 truncate max-w-[180px]'>
                          {r.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass(
                        r.role
                      )}`}
                    >
                      {roleLabel(r.role)}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right font-medium text-gray-900'>
                    {r.loginCount}
                  </td>
                  <td className='px-4 py-3 text-gray-600 whitespace-nowrap'>
                    {fmtRelative(r.lastLogin)}
                  </td>
                  <td className='px-4 py-3 text-right text-gray-600 whitespace-nowrap'>
                    {r.totalTimeHuman}
                  </td>
                  <td className='px-4 py-3 text-right text-gray-600 whitespace-nowrap'>
                    {r.avgSessionHuman}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {r.isOnline ? (
                      <span className='inline-flex items-center gap-1.5 text-xs font-medium text-green-700'>
                        <span className='h-2 w-2 rounded-full bg-green-500' />
                        Online
                      </span>
                    ) : (
                      <span className='text-xs text-gray-400'>Offline</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !errored && rows.length > 0 && (
        <div className='flex items-center justify-between px-4 py-3 border-t border-gray-100'>
          <p className='text-sm text-gray-500'>
            Page {page} of {totalPages}
          </p>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityTable;
