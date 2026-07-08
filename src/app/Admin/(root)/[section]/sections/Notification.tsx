'use client';

import React from 'react';
import { Bell } from 'lucide-react';

/**
 * Staff notifications placeholder. A shared notification feed can be wired here
 * once a staff-facing notifications endpoint is exposed; for now this keeps the
 * route valid and consistent with the lean Admin nav.
 */
const Notification = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Updates on your requests and schedule.</p>
      </div>
      <div className="bg-white rounded-xl p-10 text-center shadow-sm">
        <Bell size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500">You&apos;re all caught up.</p>
      </div>
    </div>
  );
};

export default Notification;
