'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronDown, Loader2 } from 'lucide-react';
import {
  getSubjectAnalysis,
  type SubjectAnalysisEntry,
} from '@/lib/api/superAdmin.service';

const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

const GRADE_GROUPS = [
  { label: 'A (75+)',   grades: ['A1'],             color: 'bg-green-500' },
  { label: 'B (65–74)', grades: ['B2', 'B3'],       color: 'bg-teal-400' },
  { label: 'C (50–64)', grades: ['C4', 'C5', 'C6'], color: 'bg-blue-400' },
  { label: 'D/E (40–49)', grades: ['D7', 'E8'],     color: 'bg-amber-400' },
  { label: 'F (<40)',   grades: ['F9'],              color: 'bg-red-400' },
];

const passRateBadge = (rate: number) => {
  if (rate >= 60) return 'bg-green-100 text-green-700';
  if (rate >= 40) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

function GradeBar({ dist, total }: { dist: Record<string, number>; total: number }) {
  if (!total) return <div className='w-full h-3 bg-gray-100 rounded-full' />;
  return (
    <div className='flex h-3 w-full rounded-full overflow-hidden gap-px'>
      {GRADE_GROUPS.map(({ grades, color }) => {
        const count = grades.reduce((s, g) => s + (dist[g] || 0), 0);
        if (!count) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={grades.join()}
            className={`${color} flex-shrink-0`}
            style={{ width: `${pct}%` }}
            title={`${grades.join('/')}: ${count}`}
          />
        );
      })}
    </div>
  );
}

interface SubjectAnalysisProps {
  defaultAcademicYear?: string;
  defaultTerm?: string;
  defaultClass?: string;
  classOptions?: string[];
  onBack: () => void;
}

const SubjectAnalysis: React.FC<SubjectAnalysisProps> = ({
  defaultAcademicYear = '',
  defaultTerm = '',
  defaultClass = '',
  classOptions = [],
  onBack,
}) => {
  const [academicYear, setAcademicYear] = useState(defaultAcademicYear);
  const [term, setTerm] = useState(defaultTerm);
  const [selectedClass, setSelectedClass] = useState(defaultClass);

  const [subjects, setSubjects] = useState<SubjectAnalysisEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubjectAnalysis({
        academicYear: academicYear || undefined,
        term: term || undefined,
        className: selectedClass || undefined,
      });
      if (res?.success && res.data) {
        setSubjects(res.data.subjects);
      } else {
        setError((res as any)?.message || 'Failed to load subject analysis.');
        setSubjects([]);
      }
    } catch {
      setError('Failed to load. Please try again.');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [academicYear, term, selectedClass]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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
            <h1 className='text-xl font-semibold text-gray-900'>Subject Analysis</h1>
            <p className='text-xs text-gray-500'>Performance breakdown by subject</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className='bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3'>
        <div>
          <label className='block text-xs font-medium text-gray-600 mb-1'>Academic Year</label>
          <input
            type='text'
            placeholder='e.g. 2025/2026'
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className='w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
          />
        </div>

        <div>
          <label className='block text-xs font-medium text-gray-600 mb-1'>Term</label>
          <div className='relative'>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className='w-40 appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500'
            >
              <option value=''>All terms</option>
              {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
          </div>
        </div>

        {classOptions.length > 0 && (
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>Class</label>
            <div className='relative'>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className='w-40 appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                <option value=''>All classes</option>
                {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>
          </div>
        )}

        {/* Grade distribution legend */}
        <div className='ml-auto flex items-end gap-3 flex-wrap'>
          {GRADE_GROUPS.map(({ label, color }) => (
            <div key={label} className='flex items-center gap-1.5 text-xs text-gray-500'>
              <span className={`w-3 h-3 rounded-sm ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center h-48'>
          <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
        </div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 rounded-xl px-6 py-8 text-center'>
          <p className='text-red-700 text-sm mb-3'>{error}</p>
          <button onClick={fetch} className='text-sm font-medium text-red-700 underline'>
            Retry
          </button>
        </div>
      ) : subjects.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 py-16 text-center'>
          <p className='text-gray-500 text-sm'>No subject data for these filters.</p>
          <p className='text-gray-400 text-xs mt-1'>Try selecting a specific academic year and term.</p>
        </div>
      ) : (
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 bg-gray-50'>
                  <th className='text-left py-3 px-6 text-xs font-semibold text-gray-600 w-8'>#</th>
                  <th className='text-left py-3 px-4 text-xs font-semibold text-gray-600'>Subject</th>
                  <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 w-24'>Students</th>
                  <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 w-28'>Avg Score</th>
                  <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 w-24'>Highest</th>
                  <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 w-24'>Lowest</th>
                  <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 w-28'>Pass Rate</th>
                  <th className='py-3 px-6 text-xs font-semibold text-gray-600'>Grade Distribution</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, i) => (
                  <tr key={sub.name} className='border-b border-gray-50 last:border-0 hover:bg-gray-50/50'>
                    <td className='py-4 px-6 text-sm text-gray-400'>{i + 1}</td>
                    <td className='py-4 px-4'>
                      <p className='text-sm font-semibold text-gray-900'>{sub.name}</p>
                      <p className='text-xs text-gray-400'>{sub.studentCount} student{sub.studentCount !== 1 ? 's' : ''}</p>
                    </td>
                    <td className='py-4 px-4 text-center text-sm font-medium text-gray-700'>
                      {sub.studentCount}
                    </td>
                    <td className='py-4 px-4 text-center'>
                      <span className='text-sm font-bold text-gray-900'>{sub.averageScore.toFixed(1)}</span>
                      <span className='text-xs text-gray-400'>/100</span>
                    </td>
                    <td className='py-4 px-4 text-center text-sm text-gray-600'>{sub.highestScore}</td>
                    <td className='py-4 px-4 text-center text-sm text-gray-600'>{sub.lowestScore}</td>
                    <td className='py-4 px-4 text-center'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${passRateBadge(sub.passRate)}`}>
                        {sub.passRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className='py-4 px-6'>
                      <GradeBar dist={sub.gradeDistribution} total={sub.studentCount} />
                      <div className='flex justify-between text-xs text-gray-400 mt-1'>
                        {GRADE_GROUPS.map(({ grades, color }) => {
                          const count = grades.reduce((s, g) => s + (sub.gradeDistribution[g] || 0), 0);
                          if (!count) return null;
                          return (
                            <span key={grades.join()} className='flex items-center gap-1'>
                              <span className={`w-2 h-2 rounded-sm ${color}`} />
                              {count}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectAnalysis;
