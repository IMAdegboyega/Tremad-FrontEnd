'use client'

import React from 'react'

import Attendance from '@/components/student/Home/Attendance';
import LastPosition from '@/components/student/Home/LastPosition';
import CurrentSubjects from '@/components/student/Home/CurrentSubjects';
import Notifications from '@/components/student/Home/Notifications';
import CalenderActivities from '@/components/student/Home/CalendarActivities';
import WelcomeBanner from '@/components/student/Home/WelcomeBanner';

/**
 * Home section
 *
 * Dashboard-like overview for students:
 * - Greets the user (welcome banner)
 * - Shows attendance and last position cards
 * - Displays current subjects
 * - Surfaces calendar activities and notifications (layout differs by breakpoint)
 */
const Home = () => {

  return (
    <div className='flex flex-col lg:flex-row gap-3 lg:gap-4 no-scrollbar'>
      {/* Main content (stacks on mobile; expands on desktop) */}
      <div className='flex-1 space-y-3 lg:space-y-4'>
        {/* Welcome banner (intro and quick context) */}
        <WelcomeBanner/>

        {/* Attendance and last position summary cards */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='w-full sm:w-1/2 h-full'>
            <Attendance/>
          </div>
          <div className='w-full sm:w-1/2 h-full'>
            <LastPosition/>
          </div>
        </div>

        {/* Mobile layout: upcoming activities followed by notifications */}
        <div className="block lg:hidden space-y-3 lg:space-y-4">
          <CalenderActivities />
          <Notifications />
        </div>

        {/* Current subjects table (primary academic focus) */}
        <CurrentSubjects/>
      </div>

      {/* Desktop right rail: activities + notifications */}
      <div className='hidden lg:flex flex-col w-80 space-y-4'>
        <CalenderActivities/>
        <Notifications/>
      </div>
    </div>
  )
}

export default Home