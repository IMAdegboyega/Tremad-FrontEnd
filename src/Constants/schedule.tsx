// Constants/scheduleConstants.tsx
import { BookOpen, FlaskConical, Calculator, Laptop, PenTool, Globe,  Palette } from 'lucide-react';

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