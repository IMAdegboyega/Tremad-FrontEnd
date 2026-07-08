'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Search, ChevronRight, ChevronLeft as ChevLeft, Loader2 } from 'lucide-react';
import {
  listSuperAdminResults,
  type SuperAdminResultRow,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

const PAGE_SIZE = 15;

const TERM_COLORS: Record<string, string> = {
  'First Term':  'bg-blue-50 text-blue-700',
  'Second Term': 'bg-purple-50 text-purple-700',
  'Third Term':  'bg-amber-50 text-amber-700',
};

const scoreColor = (score: number | null) => {
  if (score == null) return 'text-gray-400';
  if (score >= 70) return 'text-green-700';
  if (score >= 50) return 'text-blue-700';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
};

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return d;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const avatarColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

interface AllResultsPageProps {
  onBack: () => void;
  onViewStudent: (studentId: string, name: string, email: string) => void;
}

const AllResultsPage: React.FC<AllResultsPageProps> = ({ onBack, onViewStudent }) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<SuperAdminResultRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listSuperAdminResults({
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
        // No term / academicYear / className filter — shows everything
      });
      if (res?.success && res.data) {
        setRows(res.data.results ?? []);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
        setTotalCount(res.data.pagination?.totalCount ?? 0);
      } else {
        setError((res as any)?.message || 'Failed to load results.');
      }
    } catch {
      setError('Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-focus search on mount
  useEffect(() => { searchRef.current?.focus(); }, []);

  return (
    <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-6 space-y-4'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ChevronLeft className='w-5 h-5' />
            <span className='text-sm font-medium'>Back</span>
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>All Results</h1>
            <p className='text-xs text-gray-500'>
              {loading ? 'Loading…' : `${totalCount} result${totalCount !== 1 ? 's' : ''} across all terms`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className='relative w-full sm:w-72'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            ref={searchRef}
            type='text'
            placeholder='Search by name or email…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='w-7 h-7 animate-spin text-gray-300' />
          </div>
        ) : error ? (
          <div className='py-16 text-center'>
            <p className='text-sm text-gray-500 mb-3'>{error}</p>
            <button
              onClick={fetchAll}
              className='text-sm font-medium text-green-700 hover:text-green-900'
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className='py-16 text-center'>
            <p className='text-gray-500 text-sm'>No results found.</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 bg-gray-50'>
                    <th className='text-left py-3 px-6 text-xs font-semibold text-gray-500'>Student</th>
                    <th className='text-left py-3 px-4 text-xs font-semibold text-gray-500'>Academic Year</th>
                    <th className='text-left py-3 px-4 text-xs font-semibold text-gray-500'>Term</th>
                    <th className='text-left py-3 px-4 text-xs font-semibold text-gray-500'>Class</th>
                    <th className='text-center py-3 px-4 text-xs font-semibold text-gray-500'>Avg Score</th>
                    <th className='text-center py-3 px-4 text-xs font-semibold text-gray-500'>Position</th>
                    <th className='text-left py-3 px-6 text-xs font-semibold text-gray-500'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const fullName = `${toTitleCase(row.student.firstName)} ${toTitleCase(row.student.lastName)}`.trim();
                    return (
                      <tr
                        key={row._id}
                        onClick={() => onViewStudent(row.student._id, fullName, row.student.email)}
                        className='border-b border-gray-100 last:border-0 hover:bg-green-50/40 cursor-pointer transition-colors'
                      >
                        {/* Student */}
                        <td className='py-4 px-6'>
                          <div className='flex items-center gap-3'>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(fullName)}`}>
                              {getInitials(fullName)}
                            </div>
                            <div>
                              <p className='text-sm font-semibold text-gray-900'>{fullName}</p>
                              <p className='text-xs text-gray-400'>{row.student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Academic Year */}
                        <td className='py-4 px-4'>
                          <span className='text-sm text-gray-700'>{row.academicYear}</span>
                        </td>

                        {/* Term */}
                        <td className='py-4 px-4'>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TERM_COLORS[row.term] ?? 'bg-gray-100 text-gray-600'}`}>
                            {row.term}
                          </span>
                        </td>

                        {/* Class */}
                        <td className='py-4 px-4'>
                          <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700'>
                            {row.class}
                          </span>
                        </td>

                        {/* Avg Score */}
                        <td className='py-4 px-4 text-center'>
                          <span className={`text-sm font-bold ${scoreColor(row.totalScore)}`}>
                            {row.totalScore != null ? `${row.totalScore.toFixed(1)}%` : '—'}
                          </span>
                        </td>

                        {/* Position */}
                        <td className='py-4 px-4 text-center text-sm text-gray-600'>
                          {row.positionLabel || '—'}
                        </td>

                        {/* Status */}
                        <td className='py-4 px-6'>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            row.student.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            • {row.student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100'>
                <p className='text-xs text-gray-500'>
                  Page {page} of {totalPages}
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                  >
                    <ChevLeft className='w-4 h-4' />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                  >
                    Next
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllResultsPage;
