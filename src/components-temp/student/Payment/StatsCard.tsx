// file: src/Components/student/Payment/StatsCard.tsx
'use client'

import { getStats } from '@/Constants/Payment';
import React from 'react';

interface Props {
  activeTab?: string;
}

const StatsCard = ({ activeTab }: Props) => {
  const stats = getStats(activeTab);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map((stat, index) => (
        <div key={index} className='bg-white rounded-xl p-5 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-sm text-gray-600'>{stat.title}</span>
            <div>
              <div className='text-gray-700'>
                {stat.icon}
              </div>
            </div>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>{stat.value}</h2>
          {stat.subtitle && (
            <p className='text-xs text-gray-500 mb-1'>{stat.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCard;