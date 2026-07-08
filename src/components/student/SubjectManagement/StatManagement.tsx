'use client';

import React from 'react';
import { BookOpen, Calendar, FileText, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatManagementProps {
  totalSubjects?: number;
  pendingAssignments?: number;
  isLoading?: boolean;
}

/**
 * StatManagement
 *
 * Summary tiles for the Subjects page. Values come from real data when
 * available; fields that have no backing endpoint yet render "—" placeholders.
 */
const StatManagement: React.FC<StatManagementProps> = ({
  totalSubjects,
  pendingAssignments,
  isLoading = false,
}) => {
  const stats = [
    {
      id: '1',
      title: 'Total subjects',
      value: typeof totalSubjects === 'number' ? totalSubjects : '—',
      icon: <BookOpen size={20} />,
    },
    {
      id: '2',
      title: 'Class position',
      value: '—',
      icon: <Trophy size={20} />,
    },
    {
      id: '3',
      title: 'Overall attendance',
      value: '—',
      icon: <Calendar size={20} />,
    },
    {
      id: '4',
      title: 'Pending assignment',
      value:
        typeof pendingAssignments === 'number' ? pendingAssignments : '—',
      icon: <FileText size={20} />,
    },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className='bg-white rounded-2xl p-5 border border-gray-100'
        >
          <div className='flex items-center justify-between mb-4'>
            <span className='text-lg text-gray-600 font-semibold'>
              {stat.title}
            </span>
            <div className={'p-2 rounded-lg'}>
              <div className='text-gray-600'>{stat.icon}</div>
            </div>
          </div>

          <div className='mb-2'>
            {isLoading ? (
              <Skeleton className='h-10 w-20' />
            ) : (
              <h2 className='text-4xl font-base text-gray-900'>{stat.value}</h2>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatManagement;
