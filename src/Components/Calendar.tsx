import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasEvent?: boolean;
}

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'class' | 'meeting' | 'event' | 'exam';
  time: string;
  location?: string;
  participants?: string;
  color: string;
  bgColor: string;
}

// Mock schedule data
const MOCK_SCHEDULE: Record<string, ScheduleEvent[]> = {
  '2025-10-25': [
    {
      id: '1',
      title: 'Science Fair',
      type: 'event',
      time: '9:00 AM - 2:00 PM',
      location: 'Auditorium',
      participants: 'All Grades',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ],
  '2025-10-28': [
    {
      id: '2',
      title: 'Mathematics Class',
      type: 'class',
      time: '8:00 AM - 9:30 AM',
      location: 'Room 201',
      participants: 'Grade 10B',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ],
  '2025-11-02': [
    {
      id: '3',
      title: 'Staff Meeting',
      type: 'meeting',
      time: '3:00 PM - 4:00 PM',
      location: 'Conference Hall',
      participants: 'Teachers',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  // Fetch real-time date (fallback to local)
  useEffect(() => {
    const fetchRealDate = async () => {
      try {
        const res = await fetch('https://worldtimeapi.org/api/ip');
        const data = await res.json();
        const now = new Date(data.datetime);
        setCurrentDate(now);
        setSelectedDate(now);
        setToday(now);
      } catch {
        const local = new Date();
        setCurrentDate(local);
        setSelectedDate(local);
        setToday(local);
      }
    };
    fetchRealDate();
  }, []);

  if (!currentDate || !selectedDate || !today) {
    return <div className="text-center py-10 text-gray-500">Loading calendar...</div>;
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day;

      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      const dateKey = formatDateKey(new Date(year, month, day));
      const hasEvent = !!MOCK_SCHEDULE[dateKey];

      days.push({
        date: day,
        isCurrentMonth: true,
        isSelected,
        isToday,
        hasEvent
      });
    }

    // Next month's leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false
      });
    }

    return days;
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.isCurrentMonth) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
      setSelectedDate(newDate);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatHeader = (): string => {
    const dayOfWeek = dayNames[selectedDate.getDay()];
    const month = monthNames[selectedDate.getMonth()];
    const date = selectedDate.getDate();
    return `${month} ${date} ${dayOfWeek}`;
  };

  const days = generateCalendarDays();
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDateEvents = MOCK_SCHEDULE[selectedDateKey] || [];

  return (
    <div className="space-y-4">
      {/* Calendar Widget */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{formatHeader()}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-2">
          {weekDayLabels.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                index >= 5 ? 'text-orange-400' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!day.isCurrentMonth}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full
                transition-all duration-200 relative
                ${day.isCurrentMonth ? 'hover:bg-gray-50 cursor-pointer' : 'text-gray-300 cursor-default'}
                ${day.isSelected && day.isCurrentMonth ? 'bg-green-400 text-white font-semibold hover:bg-green-500' : ''}
                ${day.isToday && day.isCurrentMonth && !day.isSelected ? 'bg-orange-200 text-orange-600 font-semibold' : ''}
                ${!day.isCurrentMonth ? 'text-gray-300' : !day.isSelected && !day.isToday ? 'text-gray-600' : ''}
              `}
              aria-label={`${day.date} ${day.isCurrentMonth ? monthNames[currentDate.getMonth()] : ''}`}
            >
              {day.date}
              {day.hasEvent && day.isCurrentMonth && (
                <span></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Activities Widget */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Activities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">See all</button>
        </div>

        <div className="p-4 space-y-3">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className={`${event.bgColor} p-2.5 rounded-lg flex-shrink-0`}>
                  {event.type === 'class' && <CalendarIcon className={`w-5 h-5 ${event.color}`} />}
                  {event.type === 'meeting' && <Users className={`w-5 h-5 ${event.color}`} />}
                  {event.type === 'exam' && <Clock className={`w-5 h-5 ${event.color}`} />}
                  {event.type === 'event' && <MapPin className={`w-5 h-5 ${event.color}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {event.location && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                    {event.participants && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.participants}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No activities scheduled</p>
              <p className="text-xs text-gray-400 mt-1">
                Select a date with events to view activities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
