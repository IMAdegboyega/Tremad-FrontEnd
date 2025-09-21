import React from 'react'
import { Calendar } from '@/Components/ui/calendar';
import { useUser } from '@/Constants/UserContext';
import { formatEventDate, generateScheduleEvents, isEventToday, ScheduleEvent } from '@/Constants/schedule';

const CalendarActivities = () => {
  // ALL hooks must be at the top, before any conditional returns
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = React.useState<ScheduleEvent | null>(null)
  const user = useUser();

  // Define getEventsForDate before using it in useMemo
  const getEventsForDate = React.useCallback((date: Date) => {
    if (!user) return [];
    const scheduleEvents = generateScheduleEvents(user.courses);
    return scheduleEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }, [user]);

  const scheduleEvents = React.useMemo(() => {
    if (!user) return [];
    return generateScheduleEvents(user.courses);
  }, [user]);

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
  }, [scheduleEvents, selectedEvent, date, getEventsForDate]);

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

  // NOW we can do the conditional return, after all hooks
  if (!user) return null;

  return (
    <div>
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
    </div>
  )
}

export default CalendarActivities