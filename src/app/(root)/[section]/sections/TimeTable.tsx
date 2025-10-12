'use client'

import React, { useState } from 'react'
import StatsCard from '@/Components/student/TimeTable/StatsCard';
import WeekView from '@/Components/student/TimeTable/WeekView';
import DayView from '@/Components/student/TimeTable/DayView';

/**
 * TimeTable Page Component
 * 
 * Main timetable page that displays student's class schedule and academic calendar.
 * Features two viewing modes: Week view and Day view for different levels of detail.
 * 
 * Features:
 * - Toggle between Week view and Day view modes
 * - Statistics cards showing schedule overview
 * - Responsive design with mobile-optimized layout
 * - Clean, accessible interface with smooth transitions
 * - Integration with child components for different view types
 */
const TimeTable = () => {
  // State management for view mode selection
  const [viewMode, setViewMode] = useState<'Week view' | 'Day view'>('Week view');

  return (
    <div className='space-y-4 lg:space-y-6'>
      {/* Page Header Section with View Toggle */}
      <div className='p-0'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* Title and Description */}
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Timetable</h1>
            <p className='text-sm text-gray-500 mt-1'>Stay up to date with what is going on.</p>
          </div>
          
          {/* View Mode Toggle Buttons */}
          <div className='flex'>
            {/* Week View Button */}
            <button
              onClick={() => setViewMode('Week view')}
              className={`px-3 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-medium transition-all ${
                viewMode === 'Week view'
                  ? 'bg-green-700 text-white rounded-l-lg'
                  : 'bg-white text-gray-600 border border-gray-200 rounded-l-lg border-r-0 hover:bg-gray-50'
              }`}
            >
              Week view
            </button>
            {/* Day View Button */}
            <button
              onClick={() => setViewMode('Day view')}
              className={`px-3 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-medium transition-all ${
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

      {/* Statistics Overview Cards */}
      <StatsCard/>

      {/* Conditional Rendering: Week View or Day View */}
      {viewMode === 'Week view' ? <WeekView /> : <DayView />}
    </div>
  )
}

export default TimeTable