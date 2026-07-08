'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * ClassManagement
 *
 * The backend doesn't yet expose a "my subjects" endpoint, so this renders
 * a clear empty-state instead of the historical mock data. Once the backend
 * surfaces an endpoint (e.g. /student/academic/subjects), replace this with
 * a fetch + table render pattern similar to ResultsTable.
 */
const ClassManagement = () => {
  return (
    <div className='bg-white rounded-2xl shadow-sm py-16'>
      <div className='flex flex-col items-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <BookOpen className='w-8 h-8 text-gray-400' />
        </div>
        <p className='text-gray-900 font-medium mb-1'>No subjects to display</p>
        <p className='text-sm text-gray-500 text-center max-w-sm px-4'>
          Your enrolled subjects will appear here once they are assigned to your
          class.
        </p>
      </div>
    </div>
  );
};

export default ClassManagement;
