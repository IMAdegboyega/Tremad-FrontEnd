'use client'

import React from 'react'

import Attendance from '@/Components/student/Home/Attendance';
import LastPosition from '@/Components/student/Home/LastPosition';
import CurrentSubjects from '@/Components/student/Home/CurrentSubjects';
import Notifications from '@/Components/student/Home/Notifications';
import CalenderActivities from '@/Components/student/Home/CalendarActivities';
import WelcomeBanner from '@/Components/student/Home/WelcomeBanner';

const Home = () => {

  return (
    <div className='flex flex-col lg:flex-row gap-3 no-scrollbar'>
      {/* Main Content Area */}
      <div className='flex-1 space-y-4'>
        {/* Welcome Banner */}
        <WelcomeBanner/>

        {/* Attendance and Position Cards */}
        <div className='flex flex-col md:flex-row gap-3'>
          <div className='w-full md:w-1/2 h-full'>
            <Attendance/>
          </div>
          <div className='w-full md:w-1/2 h-full'>
            <LastPosition/>
          </div>
        </div>

        {/* Mobile: Upcoming Activities + Notifications */}
        <div className="block lg:hidden space-y-4">
          <CalenderActivities />
          <Notifications />
        </div>

        {/* Current Subjects Table */}
        <CurrentSubjects/>
      </div>

      {/* Right Sidebar */}
      <div className='hidden lg:flex flex-col w-80 space-y-4'>
        <CalenderActivities/>

        {/* Notifications */}
        <Notifications/>
      </div>
    </div>
  )
}

export default Home