'use client';

import React, { useMemo } from 'react';
import { Award, BookOpen, Target, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Result } from '@/lib/api/student.service';

interface StatsCardProps {
  results: Result[];
  isLoading: boolean;
}

/**
 * StatsCard (Results)
 *
 * Derives four high-level metrics from the raw `results` list returned by
 * /student/academic/results. Because the backend doesn't yet expose class-
 * level position/cohort-size data, "Overall position" and "Total students
 * in class" render as "—" placeholders.
 */
const StatsCard: React.FC<StatsCardProps> = ({ results, isLoading }) => {
  const derived = useMemo(() => {
    if (!results.length) {
      return { totalScore: '—', percentage: '—', subjectCount: 0, position: '—' };
    }

    const allSubjects = results.flatMap((r) => r.subjects ?? []);
    const scores = allSubjects.map((s) => s.scores?.total ?? 0);
    const total = scores.reduce((sum, n) => sum + n, 0);
    const average = scores.length ? total / scores.length : 0;
    const position = results.length === 1 ? (results[0].summary?.position ?? null) : null;

    return {
      totalScore: scores.length ? `${total}` : '—',
      percentage: scores.length ? `${average.toFixed(1)}%` : '—',
      subjectCount: allSubjects.length,
      position: position != null ? `${position}` : '—',
    };
  }, [results]);

  const stats = [
    {
      title: 'Overall position',
      value: derived.position,
      icon: <Award size={20} />,
    },
    {
      title: 'Average percentage',
      value: derived.percentage,
      icon: <Target size={20} />,
    },
    {
      title: 'Total score obtained',
      value: derived.totalScore,
      icon: <BookOpen size={20} />,
    },
    {
      title: 'Subjects graded',
      value: derived.subjectCount,
      icon: <Users size={20} />,
    },
  ];

  return (
    <div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'>
        {stats.map((stat, index) => (
          <div key={index} className='bg-white rounded-xl p-4 lg:p-5 shadow-sm'>
            <div className='flex items-center justify-between mb-2 lg:mb-3'>
              <span className='text-xs lg:text-sm text-gray-600'>{stat.title}</span>
              <div className='p-1.5 lg:p-2'>
                <div className='text-gray-600'>{stat.icon}</div>
              </div>
            </div>
            <div className='mb-2'>
              {isLoading ? (
                <Skeleton className='h-8 w-24' />
              ) : (
                <h2 className='text-2xl lg:text-3xl font-bold text-gray-900'>
                  {stat.value}
                </h2>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
