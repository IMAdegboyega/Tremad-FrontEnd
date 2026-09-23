'use client';

import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/student/TimeTable/StatsCard';
import WeekView from '@/components/student/TimeTable/WeekView';
import DayView from '@/components/student/TimeTable/DayView';
import { getTimetable, type TimetableEntry } from '@/lib/api/student.service';
import { formatExamDate } from '@/Constants/examDates';

/**
 * TimeTable page
 *
 * Fetches /student/academic/timetable and renders Week/Day views plus stats.
 * Views share the same `entries` array; they each derive their own layout.
 */
/**
 * The subject's catalogue colour as a dot. Grey when the period isn't linked —
 * those still render, they just have no colour to show.
 */
const SubjectDot: React.FC<{ colour?: string | null }> = ({ colour }) => (
  <span
    aria-hidden="true"
    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
    style={{ backgroundColor: colour || '#D1D5DB' }}
  />
);

const TimeTable = () => {
  const [viewMode, setViewMode] = useState<'Week view' | 'Day view'>('Week view');
  // Which timetable to show: weekly lessons, or the exam schedule the admin set.
  const [kind, setKind] = useState<'class' | 'exam'>('class');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTimetable({ type: kind })
      .then((res) => {
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setEntries(res.data);
        } else {
          setEntries([]);
        }
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return (
    <div className='space-y-4 lg:space-y-6'>
      <div className='p-0'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Timetable</h1>
            <p className='text-sm text-gray-500 mt-1'>
              {kind === 'exam'
                ? 'Your exam schedule, with halls and times.'
                : 'Stay up to date with what is going on.'}
            </p>

            {/* Lessons vs exams */}
            <div className='mt-3 inline-flex rounded-lg border border-gray-200 bg-white p-0.5'>
              {([
                ['class', 'Class timetable'],
                ['exam', 'Exam timetable'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setKind(value)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    kind === value
                      ? 'bg-green-700 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex'>
            <button
              onClick={() => setViewMode('Week view')}
              className={`px-3 lg:px-5 py-2 lg:py-2.5 text-xs w-full lg:text-sm font-medium transition-all ${
                viewMode === 'Week view'
                  ? 'bg-green-700 text-white rounded-l-lg'
                  : 'bg-white text-gray-600 border border-gray-200 rounded-l-lg border-r-0 hover:bg-gray-50'
              }`}
            >
              Week view
            </button>
            <button
              onClick={() => setViewMode('Day view')}
              className={`px-3 lg:px-5 py-2 lg:py-2.5 text-xs w-full lg:text-sm font-medium transition-all ${
                viewMode === 'Day view'
                  ? 'bg-green-700 text-white rounded-r-lg'
                  : 'bg-white text-gray-600 border border-gray-200 rounded-r-lg hover:bg-gray-50'
              }`}
            >
              Day view
            </button>
          </div>
        </div>
      </div>

      <StatsCard entries={entries} isLoading={loading} />

      {kind === 'exam' ? (
        /* Exams are dated sittings, so they read as a chronological list. */
        loading ? (
          <div className='bg-white rounded-xl p-8 text-center text-gray-400'>
            Loading exams…
          </div>
        ) : entries.length === 0 ? (
          <div className='bg-white rounded-xl p-8 text-center text-gray-400'>
            No exams have been scheduled yet.
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-sm divide-y divide-gray-100'>
            {entries.map((e) => (
              <div key={e._id} className='flex items-center gap-4 px-4 py-3'>
                <div className='w-44 shrink-0'>
                  <p className='text-sm font-medium text-gray-900'>
                    {formatExamDate(e.examDate) || e.day}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {e.startTime}–{e.endTime}
                  </p>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate flex items-center gap-2'>
                    <SubjectDot colour={e.colour} />
                    {e.subject}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {e.room ? `Hall: ${e.room}` : 'Hall to be announced'}
                    {e.teacher && e.teacher !== 'Unassigned'
                      ? ` · Invigilator: ${e.teacher}`
                      : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : viewMode === 'Week view' ? (
        <WeekView entries={entries} isLoading={loading} />
      ) : (
        <DayView entries={entries} isLoading={loading} />
      )}
    </div>
  );
};

export default TimeTable;
