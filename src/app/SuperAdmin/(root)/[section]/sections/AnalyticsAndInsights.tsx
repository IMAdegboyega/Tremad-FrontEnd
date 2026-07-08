'use client';

import React, { useState } from 'react';
import LiveNowStrip from '@/components/superadmin/Analytics/LiveNowStrip';
import UserActivityTable from '@/components/superadmin/Analytics/UserActivityTable';
import UserSessionsDialog from '@/components/superadmin/Analytics/UserSessionsDialog';

/**
 * Analytics & Insights — SuperAdmin
 *
 * The one-stop view of who uses the portal: who's online right now, and a
 * searchable/sortable table of every user's login activity (how often they log
 * in, when they last did, how long they stay, on what device). Clicking a row
 * opens that user's full login timeline.
 */
const AnalyticsAndInsights = () => {
  const [selected, setSelected] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>Analytics &amp; Insights</h1>
        <p className='text-sm text-gray-500'>
          Logins, session durations, and live activity across the portal.
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-4'>
        {/* Left: the headline login table */}
        <div className='flex-1 lg:max-w-2/3 order-2 lg:order-1'>
          <UserActivityTable
            onSelectUser={(userId, name) => setSelected({ userId, name })}
          />
        </div>

        {/* Right: who's online right now */}
        <div className='lg:w-[340px] shrink-0 order-1 lg:order-2'>
          <LiveNowStrip />
        </div>
      </div>

      <UserSessionsDialog
        userId={selected?.userId ?? null}
        fallbackName={selected?.name}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default AnalyticsAndInsights;
