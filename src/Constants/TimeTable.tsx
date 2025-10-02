import { BookOpen, Calendar, Clock, Coffee } from "lucide-react";

interface TimeSlot {
  id: string;
  subject: string;
  time: string;
  teacher: string;
  room: string;
  color: string;
  type?: 'class' | 'break' | 'free';
}

interface DaySchedule {
  day: string;
  date: string;
  slots: (TimeSlot | null)[];
}

interface StatCard {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

// Stats data
export  const stats: StatCard[] = [
    {
      title: 'Total hours',
      value: '8 hours',
      icon: <Clock size={16} />
    },
    {
      title: 'Total hours',
      value: '90%',
      icon: <Calendar size={16} />
    },
    {
      title: "Today's Subjects",
      value: '-',
      icon: <BookOpen size={16} />
    },
    {
      title: 'Free period',
      value: '42',
      icon: <Coffee size={16} />
    }
];

// Time slots for the schedule
export const timeSlots = [
  '8:00', '9:00', '10:00', '11:00', '11:30', '12:00', '13:00'
];

// Weekly schedule data
export const TimeSchedule: DaySchedule[] = [
    {
      day: 'Monday',
      date: '14th aug, 2025',
      slots: [
        { id: '1', subject: 'Science', teacher: 'Mr. Smith', room: 'Room 101', time: '8:00', color: 'bg-blue-100 text-blue-700' },
        { id: '2', subject: 'History', teacher: 'Mr. Brown', room: 'Room 203',time: '9:00', color: 'bg-purple-100 text-purple-700' },
        { id: '3', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 204', time: '10:00', color: 'bg-green-100 text-green-700' },
        { id: '4', subject: 'English Literature', teacher: 'Mrs. Davis', room: 'Room 210', time: '11:00', color: 'bg-pink-100 text-pink-700' },
        { id: 'break1', subject: 'BREAK', teacher: '', room: '', time: '12:00', color: 'bg-yellow-50 text-yellow-700', type: 'break' },
        { id: '5', subject: 'Biology', teacher: 'Mr. Wilson', room: 'Room 207', time: '1:00', color: 'bg-indigo-100 text-indigo-700' },
        { id: '6', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 204', time: '2:00', color: 'bg-green-100 text-green-700' }
      ]
    },
    {
      day: 'Tuesday',
      date: '17th aug, 2025',
      slots: [
        { id: '7', subject: 'Art', teacher: 'Ms. Lee', room: 'Room 107', time: '2:00', color: 'bg-orange-100 text-orange-700' },
        { id: '8', subject: 'Physical Education', teacher: 'Coach Lee', room: 'Gym A', time: '3:00', color: 'bg-red-100 text-red-700' },
        { id: '9', subject: 'History', teacher: 'Mr. Thompson', room: 'Room 301', time: '5:00', color: 'bg-purple-100 text-purple-700' },
        { id: '10', subject: 'Literature', teacher: 'Ms. Brown', room: 'Room 202', time: '6:00', color: 'bg-pink-100 text-pink-700' },
        { id: 'break2', subject: 'BREAK', teacher: '', room: '', time: '8:00', color: 'bg-yellow-50 text-yellow-700', type: 'break' },
        { id: '11', subject: 'Science', teacher: 'Ms. Smith', room: 'Room 101', time: '8:00', color: 'bg-blue-100 text-blue-700' },
        { id: 'free1', subject: 'FREE PERIOD', teacher: '', room: '', time: '8:00', color: 'bg-gray-50 text-gray-600', type: 'free' }
      ]
    },
    {
      day: 'Wednesday',
      date: '18th aug, 2025',
      slots: [
        { id: '12', subject: 'Chemistry', teacher: 'Dr. Johnson', room: 'Room 105', time: '8:00', color: 'bg-cyan-100 text-cyan-700' },
        { id: '13', subject: 'Geography', teacher: 'Ms. Clark', room: 'Room 205', time: '8:00', color: 'bg-teal-100 text-teal-700' },
        { id: '14', subject: 'Physical Education', teacher: 'Coach Lee', room: 'Gym', time: '8:00', color: 'bg-red-100 text-red-700' },
        { id: '15', subject: 'Computer Science', teacher: 'Mr. Kumar', room: 'Room 109', time: '8:00', color: 'bg-indigo-100 text-indigo-700' },
        { id: 'break3', subject: 'BREAK', teacher: '', room: '', time: '8:00', color: 'bg-yellow-50 text-yellow-700', type: 'break' },
        { id: '16', subject: 'Physics', teacher: 'Mr. Anderson', room: 'Room 202', time: '8:00', color: 'bg-blue-100 text-blue-700' },
        { id: '17', subject: 'Art', teacher: 'Ms. Martinez', room: 'Room 108', time: '8:00', color: 'bg-orange-100 text-orange-700' }
      ]
    },
    {
      day: 'Thursday',
      date: '19th aug, 2025',
      slots: [
        { id: '18', subject: 'Philosophy', teacher: 'Dr. White', room: 'Room 501', time: '8:00', color: 'bg-purple-100 text-purple-700' },
        { id: '19', subject: 'Psychology', teacher: 'Ms. Hall', room: 'Room 202', time: '8:00', color: 'bg-pink-100 text-pink-700' },
        { id: '20', subject: 'Drama', teacher: 'Ms. Roberts', room: 'Room 108', time: '8:00', color: 'bg-rose-100 text-rose-700' },
        { id: 'free2', subject: 'FREE PERIOD', teacher: '', room: '', time: '8:00', color: 'bg-gray-50 text-gray-600', type: 'free' },
        { id: 'break4', subject: 'BREAK', teacher: '', room: '', time: '8:00', color: 'bg-yellow-50 text-yellow-700', type: 'break' },
        { id: '21', subject: 'Music', teacher: 'Mr. Lewis', room: 'Room 204', time: '8:00', color: 'bg-violet-100 text-violet-700' },
        { id: '22', subject: 'Economics', teacher: 'Mrs. Allen', room: 'Room 207', time: '8:00', color: 'bg-emerald-100 text-emerald-700' }
      ]
    },
    {
      day: 'Friday',
      date: '20th aug, 2025',
      slots: [
        { id: '23', subject: 'Statistics', teacher: 'Mr. Chen', room: 'Room 102', time: '8:00', color: 'bg-blue-100 text-blue-700' },
        { id: '24', subject: 'Foreign Language', teacher: 'Mrs. Grant', room: 'Room 607', time: '8:00', color: 'bg-indigo-100 text-indigo-700' },
        { id: '25', subject: 'Health Education', teacher: 'Mr. Scott', room: 'Room 811', time: '8:00', color: 'bg-green-100 text-green-700' },
        { id: '26', subject: 'Civics', teacher: 'Dr. Adams', room: 'Room 403', time: '8:00', color: 'bg-cyan-100 text-cyan-700' },
        { id: 'break5', subject: 'BREAK', teacher: '', room: '', time: '8:00', color: 'bg-yellow-50 text-yellow-700', type: 'break' },
        { id: '27', subject: 'Environmental Science', teacher: 'Ms. Wright', room: 'Room 305', time: '8:00', color: 'bg-teal-100 text-teal-700' },
        { id: '28', subject: 'Statistics', teacher: 'Ms. Nelson', room: 'Room 107', time: '8:00', color: 'bg-blue-100 text-blue-700' }
      ]
    }
];