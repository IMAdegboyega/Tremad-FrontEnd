'use client';

import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Result } from '@/lib/api/student.service';
import { FileText } from 'lucide-react';

interface ResultsTableProps {
  results: Result[];
  isLoading: boolean;
}

const gradeColor = (grade: string): string => {
  const g = (grade || '').trim().toUpperCase();
  if (g.startsWith('A')) return 'bg-green-100 text-green-700';
  if (g.startsWith('B')) return 'bg-purple-100 text-purple-700';
  if (g.startsWith('C')) return 'bg-blue-100 text-blue-700';
  if (g.startsWith('D')) return 'bg-yellow-100 text-yellow-700';
  if (g.startsWith('F')) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading }) => {
  // Flatten each Result document's subjects into individual display rows.
  const rows = useMemo(
    () =>
      results.flatMap((result) =>
        (result.subjects ?? []).map((sub) => ({
          key: `${result.id}-${sub.name}`,
          subject: sub.name,
          term: result.term,
          academicYear: result.academicYear,
          firstCA: sub.scores?.firstCA ?? 0,
          secondCA: sub.scores?.secondCA ?? 0,
          exam: sub.scores?.exam ?? 0,
          total: sub.scores?.total ?? 0,
          grade: sub.grade,
          remark: sub.remark || '—',
        }))
      ),
    [results]
  );

  if (isLoading) {
    return (
      <div>
        <div className='bg-white rounded-2xl shadow-sm overflow-hidden hidden sm:block'>
          <div className='p-6 space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-12 ml-auto' />
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-4 w-14' />
                <Skeleton className='h-6 w-12' />
                <Skeleton className='h-4 w-32' />
              </div>
            ))}
          </div>
        </div>
        <div className='sm:hidden space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='bg-white rounded-xl p-5 space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className='bg-white rounded-2xl shadow-sm py-16'>
        <div className='flex flex-col items-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <FileText className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-gray-900 font-medium mb-1'>No results available yet</p>
          <p className='text-sm text-gray-500'>
            Your results will appear here once your teachers publish them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden hidden sm:block'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-white'>
                <th className='text-left py-5 px-6 text-sm font-medium text-gray-600'>Subject</th>
                <th className='text-left py-5 px-6 text-sm font-medium text-gray-600'>Term</th>
                <th className='text-center py-5 px-4 text-sm font-medium text-gray-600'>CA1 /20</th>
                <th className='text-center py-5 px-4 text-sm font-medium text-gray-600'>CA2 /20</th>
                <th className='text-center py-5 px-4 text-sm font-medium text-gray-600'>Exam /60</th>
                <th className='text-center py-5 px-4 text-sm font-medium text-gray-600'>Total</th>
                <th className='text-center py-5 px-4 text-sm font-medium text-gray-600'>Grade</th>
                <th className='text-left py-5 px-6 text-sm font-medium text-gray-600'>Remark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.key}
                  className={`${index !== rows.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className='py-5 px-6'>
                    <p className='text-sm font-medium text-gray-900'>{row.subject || '—'}</p>
                  </td>
                  <td className='py-5 px-6'>
                    <p className='text-sm text-gray-700'>
                      {[row.term, row.academicYear].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </td>
                  <td className='py-5 px-4 text-center'>
                    <p className='text-sm text-gray-700'>{row.firstCA}</p>
                  </td>
                  <td className='py-5 px-4 text-center'>
                    <p className='text-sm text-gray-700'>{row.secondCA}</p>
                  </td>
                  <td className='py-5 px-4 text-center'>
                    <p className='text-sm text-gray-700'>{row.exam}</p>
                  </td>
                  <td className='py-5 px-4 text-center'>
                    <p className='text-sm font-semibold text-gray-900'>{row.total}</p>
                  </td>
                  <td className='py-5 px-4'>
                    <div className='flex justify-center'>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${gradeColor(row.grade)}`}>
                        {row.grade || '—'}
                      </span>
                    </div>
                  </td>
                  <td className='py-5 px-6'>
                    <p className='text-sm text-gray-700'>{row.remark}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className='sm:hidden space-y-3'>
        {rows.map((row) => (
          <div key={row.key} className='bg-white rounded-xl p-5 space-y-3'>
            <div className='flex justify-between items-start'>
              <span className='text-sm font-semibold text-gray-900'>{row.subject || '—'}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${gradeColor(row.grade)}`}>
                {row.grade || '—'}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Term:</span>
              <span className='text-sm text-gray-700'>
                {[row.term, row.academicYear].filter(Boolean).join(' · ') || '—'}
              </span>
            </div>

            <div className='grid grid-cols-3 gap-2 py-2 bg-gray-50 rounded-lg px-3'>
              <div className='text-center'>
                <p className='text-xs text-gray-500'>CA1</p>
                <p className='text-sm font-medium text-gray-800'>{row.firstCA}</p>
              </div>
              <div className='text-center'>
                <p className='text-xs text-gray-500'>CA2</p>
                <p className='text-sm font-medium text-gray-800'>{row.secondCA}</p>
              </div>
              <div className='text-center'>
                <p className='text-xs text-gray-500'>Exam</p>
                <p className='text-sm font-medium text-gray-800'>{row.exam}</p>
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Total:</span>
              <span className='text-sm font-bold text-gray-900'>{row.total} / 100</span>
            </div>

            <div className='flex justify-between items-start'>
              <span className='text-sm text-gray-600'>Remark:</span>
              <span className='text-sm text-gray-700 text-right max-w-[200px]'>{row.remark}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsTable;
