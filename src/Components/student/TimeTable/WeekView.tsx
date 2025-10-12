import { timeSlots, TimeSchedule } from '@/Constants/TimeTable';
import React from 'react'

/**
 * WeekView Component
 * 
 * Displays a comprehensive weekly schedule view showing all days and time slots in a table format.
 * Features both desktop table format and mobile card layout for optimal user experience.
 * 
 * Features:
 * - Complete weekly schedule with all days and time slots
 * - Responsive design with desktop table and mobile card layouts
 * - Different slot types (classes, breaks, free periods) with color coding
 * - Interactive hover effects and clean typography
 * - Integration with TimeSchedule and timeSlots data
 */
const WeekView = () => {
  return (
    <div>
      {/* Desktop Table View - Hidden on mobile screens (lg:hidden) */}
      <div className='bg-white rounded-2xl overflow-hidden shadow-sm hidden lg:block'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                {/* Time Column Header */}
                <th className='text-left py-4 px-6 text-sm font-medium text-gray-600 border-b border-r border-gray-200 bg-white'>
                  Time
                </th>
                {/* Day Headers - Map through TimeSchedule to create day columns */}
                {TimeSchedule.map((day, index) => (
                  <th 
                    key={day.day} 
                    className={`text-center py-4 px-6 min-w-[180px] border-b border-gray-200 bg-white ${
                      index < TimeSchedule.length - 1 ? 'border-r' : ''
                    }`}
                  >
                    <div className='text-sm font-semibold text-gray-900'>{day.day}</div>
                    <div className='text-xs text-gray-500 font-normal'>({day.date})</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Map through time slots to create table rows */}
              {timeSlots.map((time, timeIndex) => {
                // Check if this is the break time slot
                const isBreakRow = time === '11:30';
                
                return (
                  <tr key={time}>
                    {/* Time Column */}
                    <td className={`py-4 px-6 text-sm text-gray-600 font-medium border-r border-gray-200 ${
                      timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                    }`}>
                      {time}
                    </td>
                    
                    {/* Map through each day to create schedule cells */}
                    {TimeSchedule.map((day, dayIndex) => {
                      const slot = day.slots[timeIndex];
                      
                      // Break period styling (special case for 11:30)
                      if (isBreakRow) {
                        return (
                          <td 
                            key={`${day.day}-${time}`} 
                            className={`py-3 px-4 bg-yellow-50 ${
                              timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                            } border-gray-200 ${
                              dayIndex < TimeSchedule.length - 1 ? 'border-r' : ''
                            }`}
                          >
                            <div className='text-yellow-600 text-center font-semibold text-sm'>
                              BREAK
                            </div>
                          </td>
                        );
                      }
                      
                      // Empty slot (no class scheduled)
                      if (!slot) {
                        return (
                          <td 
                            key={`${day.day}-${time}`} 
                            className={`py-4 px-4 ${
                              timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                            } border-gray-200 ${
                              dayIndex < TimeSchedule.length - 1 ? 'border-r' : ''
                            }`}
                          >
                          </td>
                        );
                      }
                      
                      // Free period styling
                      if (slot.type === 'free') {
                        return (
                          <td 
                            key={`${day.day}-${time}`} 
                            className={`py-4 px-4 ${
                              timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                            } border-gray-200 ${
                              dayIndex < TimeSchedule.length - 1 ? 'border-r' : ''
                            }`}
                          >
                            <div className='text-gray-500 text-center font-medium text-sm'>
                              FREE PERIOD
                            </div>
                          </td>
                        );
                      }
                      
                      // Regular class with subject, teacher, and room details
                      return (
                        <td 
                          key={`${day.day}-${time}`} 
                          className={`p-3 ${
                            timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                          } border-gray-200 ${
                            dayIndex < TimeSchedule.length - 1 ? 'border-r' : ''
                          } ${slot.color}`}
                        >
                          <div className='cursor-pointer hover:opacity-90 transition-opacity'>
                            <p className='font-semibold text-sm text-gray-800'>{slot.subject}</p>
                            <p className='text-xs text-gray-600 mt-0.5'>{slot.teacher}</p>
                            <p className='text-xs text-gray-500'>{slot.room}</p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Only visible on mobile screens (lg:hidden) */}
      <div className='lg:hidden bg-white rounded-xl overflow-hidden'>
        <div className='p-4'>
          <div className='space-y-3'>
            {/* Display current day's schedule (currently showing Tuesday - index 1) */}
            {/* TODO: Make this dynamic to allow day selection */}
            {TimeSchedule[1].slots.map((slot, index) => {
              if (!slot) return null;
              
              const time = timeSlots[index];
              
              return (
                <div key={slot.id} className='border-l-4 border-gray-200 pl-4'>
                  <div className='flex justify-between items-start'>
                    {/* Schedule Content */}
                    <div className='flex-1'>
                      {/* Conditional rendering based on slot type */}
                      {slot.type === 'break' ? (
                        // Break period styling
                        <div className='py-3'>
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
  )
}

export default WeekView