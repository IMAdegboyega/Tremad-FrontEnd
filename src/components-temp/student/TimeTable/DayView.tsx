'use client'

import { TimeSchedule, timeSlots } from '@/Constants/TimeTable';
import React, { useState } from 'react';

/**
 * DayView Component
 * 
 * Displays a detailed daily schedule view showing all time slots for a selected day.
 * Features both desktop table format and mobile card layout for optimal user experience.
 * 
 * Features:
 * - Responsive design with desktop table and mobile card layouts
 * - Time slot display with different slot types (classes, breaks, free periods)
 * - Color-coded slot types (breaks in yellow, classes in white)
 * - Clean, accessible design with proper spacing and typography
 * - Integration with TimeSchedule data and timeSlots constants
 */
const DayView = () => {
  // State management for selected day (defaults to Tuesday - index 1)
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // Tuesday
  const selectedDay = TimeSchedule[selectedDayIndex];

  return (
    <div>
      {/* Desktop Table View - Hidden on mobile screens (lg:hidden) */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden hidden lg:block'>
        <table className='w-full'>
          <thead>
            <tr>
              {/* Time Column Header */}
              <th className='text-left py-4 px-6 text-sm font-medium text-gray-600 border-b border-gray-200 bg-gray-50 w-24'>
                Time
              </th>
              {/* Selected Day Header with green background */}
              <th className='text-left py-4 px-6 border-b border-gray-200 bg-green-500 text-white'>
                <div className='font-semibold'>{selectedDay.day}</div>
                <div className='text-xs font-normal opacity-90'>({selectedDay.date})</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Map through time slots to create table rows */}
            {selectedDay.slots.map((slot, index) => {
              if (!slot) return null;
              
              return (
                <tr key={slot.id}>
                  {/* Time Column */}
                  <td className={`py-4 px-6 text-sm text-gray-600 font-medium border-r border-gray-200 ${
                    index < selectedDay.slots.length - 1 ? 'border-b' : ''
                  }`}>
                    {timeSlots[index]}
                  </td>
                  {/* Schedule Content Column with conditional styling */}
                  <td className={`py-4 px-6 ${
                    index < selectedDay.slots.length - 1 ? 'border-b border-gray-200' : ''
                  } ${
                    slot.type === 'break' ? 'bg-yellow-50' : 'bg-white'
                  }`}>
                    {/* Conditional rendering based on slot type */}
                    {slot.type === 'break' ? (
                      // Break period styling
                      <div className='text-center py-2'>
                        <span className='text-yellow-600 font-semibold text-lg'>
                          {slot.subject}
                        </span>
                      </div>
                    ) : slot.type === 'free' ? (
                      // Free period styling
                      <div className='text-center py-2'>
                        <span className='text-gray-500 font-medium text-sm'>
                          {slot.subject}
                        </span>
                      </div>
                    ) : (
                      // Regular class styling with subject, teacher, and room
                      <div className='space-y-1'>
                        <p className='font-semibold text-gray-900'>{slot.subject}</p>
                        <p className='text-sm text-gray-600'>{slot.teacher}</p>
                        <p className='text-xs text-gray-500'>{slot.room}</p>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Only visible on mobile screens (lg:hidden) */}
      <div className='lg:hidden bg-white rounded-xl overflow-hidden'>
        {/* Mobile Header with selected day info */}
        <div className='bg-green-500 text-white p-4'>
          <h3 className='font-semibold'>{selectedDay.day}</h3>
          <p className='text-sm opacity-90'>({selectedDay.date})</p>
        </div>
        {/* Mobile Content Area */}
        <div className='p-4'>
          <div className='space-y-3'>
            {/* Map through time slots to create mobile cards */}
            {selectedDay.slots.map((slot, index) => {
              if (!slot) return null;
              
              const time = timeSlots[index];
              
              return (
                <div 
                  key={slot.id} 
                  className={`border-l-4 pl-4 ${
                    slot.type === 'break' ? 'border-yellow-400' : 'border-gray-200'
                  }`}
                >
                  <div className='flex justify-between items-start'>
                    {/* Schedule Content */}
                    <div className='flex-1'>
                      {/* Conditional rendering based on slot type */}
                      {slot.type === 'break' ? (
                        // Break period with yellow background
                        <div className='py-3 bg-yellow-50 -ml-4 pl-4 pr-4 -mr-4'>
                          <p className='text-yellow-600 font-semibold text-lg'>{slot.subject}</p>
                        </div>
                      ) : slot.type === 'free' ? (
                        // Free period styling
                        <div className='py-2'>
                          <p className='text-gray-500 font-medium'>{slot.subject}</p>
                        </div>
                      ) : (
                        // Regular class with subject, teacher, and room details
                        <div className='space-y-1'>
                          <p className='font-semibold text-gray-900'>{slot.subject}</p>
                          <p className='text-sm text-gray-600'>{slot.teacher}</p>
                          <p className='text-xs text-gray-500'>{slot.room}</p>
                        </div>
                      )}
                    </div>
                    {/* Time Display */}
                    <div className='text-sm text-gray-500 font-medium ml-4'>
                      {time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;