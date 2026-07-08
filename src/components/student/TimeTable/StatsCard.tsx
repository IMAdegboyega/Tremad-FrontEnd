'use client';

import React, { useMemo } from 'react';
import { BookOpen, Calendar, Clock, Coffee } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimetableEntry } from '@/lib/api/student.service';
import { groupByDay } from './utils';

interface StatsCardProps {
  entries: TimetableEntry[];
  isLoading: boolean;
}

/**
 * Parse a "HH:MM" string to minutes since midnight. Returns null on bad input.
 */
const toMinutes = (t?: string): number | null => {
  if (!t) return null;
  const [h, m] = t.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/**
 * StatsCard (Timetable)
 *
 * Derives total weekly teaching hours, unique subject count, today's classes,
 * and an estimate of free periods from the entries list. All of these are
 * computed on the frontend since the backend doesn't return a summary.
 */
const StatsCard: React.FC<StatsCardProps> = ({ entries, isLoading }) => {
  const derived = useMemo(() => {
    const totalMinutes = entries.reduce((acc, e) => {
      const start = toMinutes(e.startTime);
      const end = toMinutes(e.endTime);
      if (start == null || end == null || end <= start) return acc;
      return acc + (end - start);
    }, 0);

    const uniqueSubjects = new Set(
      entries.map((e) => (e.subject || '').trim()).filter(Boolean)
    );

    const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayCount = entries.filter(
      (e) => (e.day || '').toLowerCase() === todayLabel.toLowerCase()
    ).length;

    // Free periods = gaps between consecutive classes on the same day, summed
    // across the week. groupByDay already sorts each day by start time.
    const byDay = groupByDay(entries);
    let freePeriods = 0;
    Object.values(byDay).forEach((list) => {
      for (let i = 1; i < list.length; i++) {
        const prevEnd = toMinutes(list[i - 1].endTime);
        const nextStart = toMinutes(list[i].startTime);
        if (prevEnd != null && nextStart != null && nextStart > prevEnd) {
          freePeriods += 1;
        }
      }
    });

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      subjectCount: uniqueSubjects.size,
      todayCount,
      freePeriods,
    };
  }, [entries]);

  const stats = [
    {
      title: 'Total hours',
      value: entries.length ? `${derived.totalHours}h` : '—',
      icon: <Clock size={16} />,
    },
    {
      title: 'Subjects',
      value: entries.length ? derived.subjectCount : '—',
      icon: <Calendar size={16} />,
    },
    {
      title: "Today's classes",
      value: entries.length ? derived.todayCount : '—',
      icon: <BookOpen size={16} />,
    },
    {
      title: 'Free periods',
      value: entries.length ? derived.freePeriods : '—',
      icon: <Coffee size={16} />,
    },
  ];

  return (
    <div>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-2'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='bg-white rounded-lg p-3 lg:p-4 border border-gray-100'
          >
            <div className='flex items-center justify-between mb-1 lg:mb-2'>
              <span className='text-xs lg:text-sm text-gray-600'>{stat.title}</span>
              <div className='text-gray-400 scale-75 lg:scale-100'>{stat.icon}</div>
            </div>
            {isLoading ? (
              <Skeleton className='h-7 w-16' />
            ) : (
              <p className='text-xl lg:text-2xl font-bold text-gray-900'>
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
