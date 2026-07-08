// Constants/scheduleConstants.tsx
import { BookOpen, FlaskConical, Calculator, Laptop, PenTool, Globe,  Palette } from 'lucide-react';
import type { TimetableEntry } from '@/lib/api/student.service';

// Schedule event type
export interface ScheduleEvent {
  id: string;
  courseId: number;
  subject: string;
  teacher: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  type: 'class' | 'exam' | 'lab' | 'practical';
}

interface Course {
  id: number;
  subject: string;
  teacher: string;
  department: string;
}

// Course color mapping based on departments
export const DEPARTMENT_COLORS = {
  'Science Department': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    hover: 'hover:bg-purple-200',
    icon: <FlaskConical className="w-5 h-5" />
  },
  'Math Department': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-200',
    icon: <Calculator className="w-5 h-5" />
  },
  'English Department': {
    bg: 'bg-green-100',
    text: 'text-green-700',
    hover: 'hover:bg-green-200',
    icon: <PenTool className="w-5 h-5" />
  },
  'Arts Department': {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    hover: 'hover:bg-pink-200',
    icon: <Palette className="w-5 h-5" />
  },
  'Computer Science': {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    hover: 'hover:bg-orange-200',
    icon: <Laptop className="w-5 h-5" />
  },
  'Social Studies': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    hover: 'hover:bg-yellow-200',
    icon: <Globe className="w-5 h-5" />
  }
} as const;

// Default color for unknown departments
export const DEFAULT_DEPARTMENT_COLOR = {
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  hover: 'hover:bg-gray-200',
  icon: <BookOpen className="w-5 h-5" />
};

// Class schedule timings
export const CLASS_TIMINGS = [
  { start: '8:00 AM', end: '8:45 AM' },
  { start: '9:00 AM', end: '9:45 AM' },
  { start: '10:00 AM', end: '10:45 AM' },
  { start: '11:00 AM', end: '11:45 AM' },
  { start: '12:00 PM', end: '12:45 PM' },
  { start: '2:00 PM', end: '2:45 PM' },
  { start: '3:00 PM', end: '3:45 PM' },
];

// Activity types with their icons
export const ACTIVITY_TYPES = {
  class: { label: 'Class', icon: <BookOpen className="w-5 h-5" /> },
  lab: { label: 'Lab', icon: <FlaskConical className="w-5 h-5" /> },
  practical: { label: 'Practical', icon: <Laptop className="w-5 h-5" /> },
  exam: { label: 'Exam', icon: <PenTool className="w-5 h-5" /> },
} as const;

// Generate schedule events based on courses
export const generateScheduleEvents = (courses: Course[]): ScheduleEvent[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const events: ScheduleEvent[] = [];
  
  // Define recurring schedule pattern (which courses happen on which days)
  const schedulePattern = [
    { dayOfMonth: 7, courseIndices: [0, 2], timeSlots: [1, 3] },
    { dayOfMonth: 12, courseIndices: [1, 3], timeSlots: [0, 2] },
    { dayOfMonth: 19, courseIndices: [0, 1], timeSlots: [2, 4] },
    { dayOfMonth: 21, courseIndices: [2, 3], timeSlots: [1, 3] },
    { dayOfMonth: 30, courseIndices: [0, 1, 2, 3], timeSlots: [0, 1, 2, 3] },
  ];
  
  schedulePattern.forEach(({ dayOfMonth, courseIndices, timeSlots }) => {
    courseIndices.forEach((courseIndex, idx) => {
      if (courseIndex < courses.length) {
        const course = courses[courseIndex];
        const timeSlot = CLASS_TIMINGS[timeSlots[idx] || 0];
        const deptColor = DEPARTMENT_COLORS[course.department as keyof typeof DEPARTMENT_COLORS] || DEFAULT_DEPARTMENT_COLOR;
        
        // Determine activity type based on course and day
        let activityType: keyof typeof ACTIVITY_TYPES = 'class';
        if (course.subject.toLowerCase().includes('practical') || course.subject.toLowerCase().includes('computer')) {
          activityType = 'practical';
        } else if (course.subject.toLowerCase().includes('lab') || course.subject.toLowerCase().includes('chemistry')) {
          activityType = 'lab';
        }
        
        events.push({
          id: `${course.id}-${dayOfMonth}-${idx}`,
          courseId: course.id,
          subject: course.subject,
          teacher: course.teacher,
          date: new Date(currentYear, currentMonth, dayOfMonth),
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          color: `${deptColor.bg} ${deptColor.text}`,
          bgColor: deptColor.bg,
          icon: ACTIVITY_TYPES[activityType].icon,
          type: activityType
        });
      }
    });
  });
  
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Palette cycled by subject so the same subject keeps its colour.
const SUBJECT_PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-yellow-100 text-yellow-700',
];

const colorForSubject = (subject: string): string => {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** "14:30" (24h) -> "2:30 PM" for display. */
const to12Hour = (hhmm: string): string => {
  const [h, m] = (hhmm || '').split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm || '';
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Turn a student's weekly timetable into concrete dated events for the next 7
 * days, so the Home "Upcoming Activities" widget shows their real upcoming
 * classes (replacing the old mock schedule).
 */
export const timetableToScheduleEvents = (
  entries: TimetableEntry[]
): ScheduleEvent[] => {
  if (!entries || entries.length === 0) return [];

  const events: ScheduleEvent[] = [];
  const today = new Date();

  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + offset
    );
    const weekdayIndex = date.getDay();

    entries.forEach((entry, i) => {
      if (WEEKDAY_INDEX[entry.day] !== weekdayIndex) return;
      const color = colorForSubject(entry.subject || '');
      events.push({
        id: `${entry._id || `${entry.subject}-${i}`}-${date.toDateString()}`,
        courseId: 0,
        subject: entry.subject,
        teacher: entry.teacher,
        date,
        startTime: to12Hour(entry.startTime),
        endTime: to12Hour(entry.endTime),
        color,
        bgColor: color.split(' ')[0],
        icon: ACTIVITY_TYPES.class.icon,
        type: 'class',
      });
    });
  }

  // Already chronological: outer loop advances by day, and the API returns each
  // day's entries pre-sorted by start time.
  return events;
};

// Helper function to get color for a specific date based on events
export const getDateColor = (events: ScheduleEvent[]): string => {
  if (events.length === 0) return '';
  
  // If multiple events, return the color of the first one
  const firstEvent = events[0];
  const deptColor = DEPARTMENT_COLORS[firstEvent.subject as keyof typeof DEPARTMENT_COLORS];
  
  if (deptColor) {
    return deptColor.text;
  }
  
  // Extract color from the event's color string
  return firstEvent.color.split(' ')[1] || 'text-gray-700';
};

// Format date for display
export const formatEventDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

// Check if an event is today
export const isEventToday = (eventDate: Date): boolean => {
  const today = new Date();
  return eventDate.getDate() === today.getDate() &&
         eventDate.getMonth() === today.getMonth() &&
         eventDate.getFullYear() === today.getFullYear();
};

// Check if an event is upcoming (within next 7 days)
export const isEventUpcoming = (eventDate: Date): boolean => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return eventDate >= today && eventDate <= nextWeek;
};