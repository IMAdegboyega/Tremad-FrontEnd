'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimetableEntry } from '@/lib/api/student.service';
import {
  WEEKDAYS,
  colorForSubject,
  entryAt,
  normalizeTime,
  uniqueStartTimes,
} from './utils';

interface WeekViewProps {
  entries: TimetableEntry[];
  isLoading: boolean;
}

/**
 * WeekView
 *
 * Grid of entire week × all unique class start times. Rows are the time
 * slots sorted ascending; columns are Mon-Fri. Empty cells render blank.
 */
const WeekView: React.FC<WeekViewProps> = ({ entries, isLoading }) => {
  if (isLoading) {
    return (
      <div className='bg-white rounded-2xl overflow-hidden shadow-sm'>
        <div className='p-6 space-y-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='grid grid-cols-6 gap-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
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
            Your weekly schedule will appear here once published.
          </p>
        </div>
      </div>
    );
  }

  const times = uniqueStartTimes(entries);
  const todayLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  return (
    <div>
      {/* Desktop Table View */}
      <div className='bg-white rounded-2xl overflow-hidden shadow-sm hidden lg:block'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                <th className='text-left py-4 px-6 text-sm font-medium text-gray-600 border-b border-r border-gray-200 bg-white'>
                  Time
                </th>
                {WEEKDAYS.map((day, index) => (
                  <th
                    key={day}
                    className={`text-center py-4 px-6 min-w-[180px] border-b border-gray-200 bg-white ${
                      index < WEEKDAYS.length - 1 ? 'border-r' : ''
                    }`}
                  >
                    <div className='text-sm font-semibold text-gray-900'>{day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time, timeIndex) => (
                <tr key={time}>
                  <td
                    className={`py-4 px-6 text-sm text-gray-600 font-medium border-r border-gray-200 ${
                      timeIndex < times.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    {time}
                  </td>

                  {WEEKDAYS.map((day, dayIndex) => {
                    const slot = entryAt(entries, day, time);
                    const rowBorder =
                      timeIndex < times.length - 1 ? 'border-b' : '';
                    const colBorder =
                      dayIndex < WEEKDAYS.length - 1 ? 'border-r' : '';

                    if (!slot) {
                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`py-4 px-4 ${rowBorder} border-gray-200 ${colBorder}`}
                        />
                      );
                    }

                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`p-3 ${rowBorder} border-gray-200 ${colBorder} ${colorForSubject(
                          slot.subject
                        )}`}
                      >
                        <div className='cursor-pointer hover:opacity-90 transition-opacity'>
                          <p className='font-semibold text-sm text-gray-800'>
                            {slot.subject}
                          </p>
                          <p className='text-xs text-gray-600 mt-0.5'>
                            {slot.teacher || '—'}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {slot.room || ''}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View — shows today's classes, falls back to Monday */}
      <div className='lg:hidden bg-white rounded-xl overflow-hidden'>
        <div className='p-4'>
          <div className='space-y-3'>
            {(() => {
              const preferredDay =
                entries.find((e) => (e.day || '').toLowerCase() === todayLabel)
                  ?.day || entries[0]?.day;
              const todaysEntries = entries
                .filter(
                  (e) =>
                    (e.day || '').toLowerCase() ===
                    (preferredDay || '').toLowerCase()
                )
                .sort((a, b) =>
                  normalizeTime(a.startTime).localeCompare(
                    normalizeTime(b.startTime)
                  )
                );

              if (!todaysEntries.length) {
                return (
                  <p className='text-sm text-gray-500 py-8 text-center'>
                    No classes scheduled.
                  </p>
                );
              }

              return todaysEntries.map((slot) => (
                <div
                  key={slot._id}
                  className='border-l-4 border-gray-200 pl-4'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='space-y-1'>
                        <p className='font-semibold text-gray-900'>
                          {slot.subject}
                        </p>
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
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
