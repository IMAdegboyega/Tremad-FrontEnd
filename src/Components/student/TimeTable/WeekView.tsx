import { timeSlots, TimeSchedule } from '@/Constants/TimeTable';
import React from 'react'

const WeekView = () => {
  return (
    <div>
      {/* Timetable */}
      <div className='bg-white rounded-2xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                <th className='text-left py-4 px-6 text-sm font-medium text-gray-600 border-b border-r border-gray-200 bg-white'>
                  Time
                </th>
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
              {timeSlots.map((time, timeIndex) => {
                // Check if this is a break row (11:30)
                const isBreakRow = time === '11:30';
                
                return (
                  <tr key={time}>
                    {/* Time cell */}
                    <td className={`py-4 px-6 text-sm text-gray-600 font-medium border-r border-gray-200 ${
                      timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                    }`}>
                      {time}
                    </td>
                    
                    {/* Day cells */}
                    {TimeSchedule.map((day, dayIndex) => {
                      const slot = day.slots[timeIndex];
                      
                      // Break row styling (yellow background for all cells)
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
                      
                      // Empty slot
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
                      
                      // Regular class slot with colored background
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
    </div>
  )
}

export default WeekView