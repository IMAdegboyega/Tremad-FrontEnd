'use client'

import React, { useState } from 'react'
import WelcomeBanner from '@/components/superadmin/Home/WelcomeBanner'
import StatsCards from '@/components/superadmin/Home/StatsCards'
import LiveActivity from '@/components/superadmin/Home/LiveActivity'
import CalendarSection from '@/components/superadmin/Home/CalendarSection'
import UpcomingActivities from '@/components/superadmin/Home/UpcomingActivities'
import CalendarActivities from '@/components/student/Home/CalendarActivities'
import Calendar from '@/components/Calendar'

/**
 * SuperAdmin Dashboard
 * 
 * Overview dashboard for school administrators:
 * - Welcome banner with admin info
 * - Key stats (students, teachers, revenue, approvals)
 * - Live activity feed
 * - Calendar view and upcoming activities
 */
const Home = () => {

  const [showAllActivity, setShowAllActivity] = useState(false)

  // If viewing all activities, show full-page view
  if (showAllActivity) {
    return (
      <div className='flex flex-col gap-4'>
        <LiveActivity 
          isFullView={true} 
          onBack={() => setShowAllActivity(false)} 
        />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Stats Cards Grid */}
      <StatsCards />

      {/* Main Content Area */}
      <div className='flex flex-col lg:flex-row gap-4 lg:w-full'>
        {/* Left Section: Live Activity */}
        <div className='flex-1 lg:max-w-2/3 '>
          <LiveActivity
            isFullView={false} 
            onSeeAll={() => setShowAllActivity(true)}
          />
        </div>

        {/* Right Section: Calendar and Activities */}
        <div className='flex-1 lg:max-w-1/3'>
          <div className='space-y-4'>
            <Calendar />
            {/* <UpcomingActivities /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home