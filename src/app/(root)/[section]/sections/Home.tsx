'use client'
import AttendanceChart, { PositionChart } from '@/Components/StudentChats';
import { useUser, departmentImages, fallbackDepartmentImage } from '@/Constants/UserContext';
import { 
  generateScheduleEvents, 
  getDateColor, 
  formatEventDate,
  isEventToday,
  isEventUpcoming,
  type ScheduleEvent 
} from '@/Constants/schedule';
import Image from 'next/image';
import { Button } from "@/Components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import React from 'react'
import { ChevronDown } from 'lucide-react';
import { Calendar } from '@/Components/ui/calendar';

const Home = () => {
  const [position, setPosition] = React.useState("bottom")
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = React.useState<ScheduleEvent | null>(null)

  const user = useUser();
  if (!user) return null;

  const termData = user.terms[user.term];
  const courses = user.courses;
  
  // Generate schedule events from courses
  const scheduleEvents = React.useMemo(() => generateScheduleEvents(courses), [courses]);
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return scheduleEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Get upcoming events (sorted by date and time)
  const upcomingEvents = React.useMemo(() => {
    const today = new Date();
    
    // If a specific date is selected and has events, show those events
    if (date && selectedEvent) {
      const dateEvents = getEventsForDate(date);
      return dateEvents.length > 0 ? dateEvents : [selectedEvent];
    }
    
    // Otherwise show upcoming events
    const upcoming = scheduleEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 2); // Show 2 upcoming events by default
    
    return upcoming;
  }, [scheduleEvents, selectedEvent, date]);

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const events = getEventsForDate(newDate);
      if (events.length > 0) {
        setSelectedEvent(events[0]); // Select first event of the day
      } else {
        setSelectedEvent(null);
      }
    }
  };

  return (
    <div className='flex gap-3'>
      {/* Main Content Area */}
      <div className='flex-1 space-y-4'>
        {/* Welcome Banner */}
        <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-2xl p-4 text-white'>
          <div className='flex flex-col items-start justify-center p-4 space-y-1'>
            <h1 className='text-4xl font-base'>Hi {user.firstName}!</h1>
            <span className='font-base text-gray-300'>{user.id}</span>
            <span className='font-base text-gray-300'>
              <p>{user.grade} {user.classCategory} {user.term}</p>
            </span>
            <h2 className='text-2xl font-base'>Welcome To TREMAD Schools Portal.</h2>
          </div>
          <div className='flex items-center justify-center ml-auto p-4'>
            <Image
              src={'/img/ladywriting.svg'}
              alt='penLady'
              width={100}
              height={100}
            />
          </div>
        </div>

        {/* Attendance and Position Cards */}
        <div className='flex gap-3'>
          <div className='flex flex-col bg-white p-4 rounded-2xl w-1/2 text-black'>
            <div className='flex'>
              <h2>Attendance</h2>
              <div className='ml-auto'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='cursor-pointer'>
                      {user.term} <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup
                      value={user.term}
                      onValueChange={(val) => user.setTerm(val)}
                    >
                      <DropdownMenuRadioItem value="1st Term">1st Term</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="2nd Term">2nd Term</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="3rd Term">3rd Term</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <AttendanceChart
                value={termData.attendance.value}
                maxValue={termData.attendance.maxValue}
                label={termData.attendance.label}
              />
            </div>
          </div>

          <div className='flex flex-col bg-white p-4 rounded-2xl w-1/2 text-black'>
            <div className='flex'>
              <h2>Last Position</h2>
              <div className='ml-auto'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='cursor-pointer'>
                      {user.term} <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup
                      value={user.term}
                      onValueChange={(val) => user.setTerm(val)}
                    >
                      <DropdownMenuRadioItem value="1st Term">1st Term</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="2nd Term">2nd Term</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="3rd Term">3rd Term</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <PositionChart
              rank={termData.position.rank}
              percentage={termData.position.percentage}
            />
          </div>
        </div>

        {/* Current Subjects Table */}
        <div className='flex flex-col bg-white p-6 rounded-2xl w-full space-y-2'>
          <div className='flex justify-between'>
            <h2>Current Subjects</h2>
            <div className='text-green-700 ml-auto cursor-pointer'>
              View all
            </div>
          </div>

          <div className="w-full bg-white border border-gray-300 rounded-2xl">
            <table className="w-full border-seperate border-spacing-0 rounded-2xl">
              <thead className='bg-gray-50'>
                <tr className="border-b border-gray-500">
                  <th className="rounded-tl-2xl text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Subject name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Teacher
                  </th>
                  <th className="rounded-tr-2xl text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr 
                    key={course.id} 
                    className={index !== courses.length - 1 ? 'border-b border-gray-50' : ''}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${course.iconBg || 'bg-gray-100'} rounded-full flex items-center justify-center text-xl`}>
                          {departmentImages[course.department] ? (
                            <Image
                              src={departmentImages[course.department] || fallbackDepartmentImage}
                              alt={course.department}
                              width={48}
                              height={48}
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <span>{course.icon || '📚'}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course.subject}
                          </div>
                          <div className="text-xs text-gray-500">
                            {course.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">
                        {course.teacher}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className='bg-gray-50 text-green-700 text-sm hover:text-green-900 items-center justify-center w-max px-4 py-2 rounded-lg cursor-pointer'>
                        View course
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='w-80 space-y-4'>
        <div className='space-y-2 bg-white rounded-2xl'>
          {/* Calendar with event indicators */}
          <div className='bg-white rounded-2xl p-4'>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border-0"
              modifiers={{
                hasEvent: (date) => getEventsForDate(date).length > 0
              }}
              modifiersClassNames={{
                hasEvent: "relative"
              }}
            /> 
          </div>

          {/* Upcoming Activities */}
          <div className='bg-white rounded-2xl p-4'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>Upcoming Activities</h3>
              <span 
                className='text-sm text-green-700 cursor-pointer hover:text-green-900'
                onClick={() => {
                  setDate(undefined);
                  setSelectedEvent(null);
                }}
              >
                See all
              </span>
            </div>
                
            <div className='space-y-3'>
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={`flex gap-3 items-start cursor-pointer transition-all ${
                    selectedEvent?.id === event.id ? 'bg-gray-50 -mx-2 px-2 py-1 rounded-lg' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className={`w-10 h-10 ${event.color.split(' ')[0]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-5 h-5 ${event.color.split(' ')[1]}`}>
                      {event.icon}
                    </div>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{event.subject}</p>
                    <p className='text-xs text-gray-600'>{event.teacher}</p>
                    <p className='text-xs text-gray-500'>
                      {formatEventDate(event.date)} • {event.startTime} - {event.endTime}
                      {isEventToday(event.date) && (
                        <span className='ml-2 text-green-600 font-medium'>Today</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className='bg-white rounded-2xl p-4'>
          <h3 className='text-lg font-semibold mb-4'>Notifications</h3>
          <div className='text-sm text-gray-500'>
            {date && selectedEvent ? (
              <div className='space-y-2'>
                <p className='text-gray-700 font-medium'>Showing events for:</p>
                <p className='text-gray-600'>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className='text-xs text-gray-500'>Click the same date again to deselect</p>
              </div>
            ) : date && !selectedEvent ? (
              <div className='space-y-2'>
                <p className='text-gray-600'>No events on this date</p>
                <p className='text-xs text-gray-500'>Click the date again to deselect</p>
              </div>
            ) : (
              <div className='space-y-2'>
                <p className='text-gray-600'>Click any date to see its schedule</p>
                <p className='text-xs text-gray-500'>Showing all upcoming activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home