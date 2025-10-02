'use client'

import { TimeSchedule, timeSlots } from '@/Constants/TimeTable';
import React, { useState } from 'react';

const DayView = () => {
  // You can make this dynamic - for now using Tuesday (index 1)
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // Tuesday
  const selectedDay = TimeSchedule[selectedDayIndex];

  return (
    <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
      <table className='w-full'>
        <thead>
          <tr>
            <th className='text-left py-4 px-6 text-sm font-medium text-gray-600 border-b border-gray-200 bg-gray-50 w-24'>
              Time
            </th>
            <th className='text-left py-4 px-6 border-b border-gray-200 bg-green-500 text-white'>
              <div className='font-semibold'>{selectedDay.day}</div>
              <div className='text-xs font-normal opacity-90'>({selectedDay.date})</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {selectedDay.slots.map((slot, index) => {
            // Skip null slots
            if (!slot) return null;
            
            return (
              <tr key={slot.id}>
                <td className={`py-4 px-6 text-sm text-gray-600 font-medium border-r border-gray-200 ${
                  index < selectedDay.slots.length - 1 ? 'border-b' : ''
                }`}>
                  {timeSlots[index]} {/* Use the timeSlots array for consistent time display */}
                </td>
                <td className={`py-4 px-6 ${
                  index < selectedDay.slots.length - 1 ? 'border-b border-gray-200' : ''
                } ${
                  slot.type === 'break' ? 'bg-yellow-50' : 'bg-white'
                }`}>
                  {slot.type === 'break' ? (
                    <div className='text-center py-2'>
                      <span className='text-yellow-600 font-semibold text-lg'>
                        {slot.subject}
                      </span>
                    </div>
                  ) : slot.type === 'free' ? (
                    <div className='text-center py-2'>
                      <span className='text-gray-500 font-medium text-sm'>
                        {slot.subject}
                      </span>
                    </div>
                  ) : (
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
  );
};

export default DayView;