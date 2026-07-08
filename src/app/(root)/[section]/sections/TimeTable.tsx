'use client';

import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/student/TimeTable/StatsCard';
import WeekView from '@/components/student/TimeTable/WeekView';
import DayView from '@/components/student/TimeTable/DayView';
import { getTimetable, type TimetableEntry } from '@/lib/api/student.service';

/**
 * TimeTable page
 *
 * Fetches /student/academic/timetable and renders Week/Day views plus stats.
 * Views share the same `entries` array; they each derive their own layout.
 */
const TimeTable = () => {
  const [viewMode, setViewMode] = useState<'Week view' | 'Day view'>('Week view');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTimetable()
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
  }, []);

  return (
    <div className='space-y-4 lg:space-y-6'>
      <div className='p-0'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Timetable</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Stay up to date with what is going on.
            </p>
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

      {viewMode === 'Week view' ? (
        <WeekView entries={entries} isLoading={loading} />
      ) : (
        <DayView entries={entries} isLoading={loading} />
      )}
    </div>
  );
};

export default TimeTable;
