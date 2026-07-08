'use client';

import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimetableEntry } from '@/lib/api/student.service';
import { WEEKDAYS, normalizeTime } from './utils';

interface DayViewProps {
  entries: TimetableEntry[];
  isLoading: boolean;
}

/**
 * DayView
 *
 * Vertical list of a single day's classes. Defaults to today when the
 * timetable includes today; otherwise falls back to the earliest weekday
 * that has classes.
 */
const DayView: React.FC<DayViewProps> = ({ entries, isLoading }) => {
  // Pick the default day once from the incoming entries.
  const defaultDay = useMemo(() => {
    const today = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    const daysWithClasses = WEEKDAYS.filter((d) =>
      entries.some((e) => (e.day || '').toLowerCase() === d.toLowerCase())
    );
    if (!daysWithClasses.length) return 'Monday';
    const match = daysWithClasses.find((d) => d.toLowerCase() === today);
    return match || daysWithClasses[0];
  }, [entries]);

  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);

  // Keep the selected day in sync when the default changes (e.g. after fetch)
  React.useEffect(() => {
    setSelectedDay(defaultDay);
  }, [defaultDay]);

  if (isLoading) {
    return (
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        <div className='p-6 space-y-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-12 flex-1' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className='bg-white rounded-2xl shadow-sm py-16'>
        <div className='flex flex-col items-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <Calendar className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-gray-900 font-medium mb-1'>No timetable available yet</p>
          <p className='text-sm text-gray-500'>
            Your schedule will appear here once published.
          </p>
        </div>
      </div>
    );
  }

  const dayEntries = entries
    .filter((e) => (e.day || '').toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) =>
      normalizeTime(a.startTime).localeCompare(normalizeTime(b.startTime))
    );

  return (
    <div>
      {/* Day selector — lets the student pivot through the week */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {WEEKDAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedDay.toLowerCase() === day.toLowerCase()
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden hidden lg:block'>
        <table className='w-full'>
          <thead>
            <tr>
              <th className='text-left py-4 px-6 text-sm font-medium text-gray-600 border-b border-gray-200 bg-gray-50 w-24'>
                Time
              </th>
              <th className='text-left py-4 px-6 border-b border-gray-200 bg-green-500 text-white'>
                <div className='font-semibold'>{selectedDay}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {dayEntries.length === 0 ? (
              <tr>
                <td colSpan={2} className='py-8 px-6 text-center text-sm text-gray-500'>
                  No classes scheduled for {selectedDay}.
                </td>
              </tr>
            ) : (
              dayEntries.map((slot, index) => (
                <tr key={slot._id}>
                  <td
                    className={`py-4 px-6 text-sm text-gray-600 font-medium border-r border-gray-200 ${
                      index < dayEntries.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    {normalizeTime(slot.startTime)}
                    {slot.endTime ? ` – ${normalizeTime(slot.endTime)}` : ''}
                  </td>
                  <td
                    className={`py-4 px-6 bg-white ${
                      index < dayEntries.length - 1
                        ? 'border-b border-gray-200'
                        : ''
                    }`}
                  >
                    <div className='space-y-1'>
                      <p className='font-semibold text-gray-900'>{slot.subject}</p>
                      <p className='text-sm text-gray-600'>
                        {slot.teacher || '—'}
                      </p>
                      {slot.room && (
                        <p className='text-xs text-gray-500'>{slot.room}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='lg:hidden bg-white rounded-xl overflow-hidden'>
        <div className='bg-green-500 text-white p-4'>
          <h3 className='font-semibold'>{selectedDay}</h3>
        </div>
        <div className='p-4'>
          {dayEntries.length === 0 ? (
            <p className='text-sm text-gray-500 py-8 text-center'>
              No classes scheduled for {selectedDay}.
            </p>
          ) : (
            <div className='space-y-3'>
              {dayEntries.map((slot) => (
                <div key={slot._id} className='border-l-4 pl-4 border-gray-200'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='space-y-1'>
                        <p className='font-semibold text-gray-900'>{slot.subject}</p>
                        <p className='text-sm text-gray-600'>
                          {slot.teacher || '—'}
                        </p>
                        {slot.room && (
                          <p className='text-xs text-gray-500'>{slot.room}</p>
                        )}
                      </div>
                    </div>
                    <div className='text-sm text-gray-500 font-medium ml-4'>
                      {normalizeTime(slot.startTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;
