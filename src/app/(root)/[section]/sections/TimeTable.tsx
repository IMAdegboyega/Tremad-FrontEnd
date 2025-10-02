'use client'

import React, { useState } from 'react'
import StatsCard from '@/Components/student/TimeTable/StatsCard';
import WeekView from '@/Components/student/TimeTable/WeekView';
import DayView from '@/Components/student/TimeTable/DayView';


const TimeTable = () => {
  const [viewMode, setViewMode] = useState<'Week view' | 'Day view'>('Week view');
  

  return (
    <div className='space-y-6'>
      {/* Header with toggle */}
      <div className='p-0'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Timetable</h1>
            <p className='text-sm text-gray-500 mt-1'>Stay up to date with what is going on.</p>
          </div>
          
          <div className='flex'>
            <button
              onClick={() => setViewMode('Week view')}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                viewMode === 'Week view'
                  ? 'bg-green-700 text-white rounded-l-lg'
                  : 'bg-white text-gray-600 border border-gray-200 rounded-l-lg border-r-0 hover:bg-gray-50'
              }`}
            >
              Week view
            </button>
            <button
              onClick={() => setViewMode('Day view')}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
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

      <StatsCard/>

      {viewMode === 'Week view' ? <WeekView /> : <DayView />}
    </div>
  )
}

export default TimeTable