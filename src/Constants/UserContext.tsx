// context/UserContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

//
// 1. Types
//
type TermData = {
  attendance: {
    value: number;
    maxValue: number;
    label: string;
  };
  position: {
    rank: string;
    percentage: number;
  };
};

export interface Course {
  id: number;
  subject: string;
  department: string;
  teacher: string;
  icon: string;
  iconBg?: string;
}

// types/notification.ts
export type Notification = {
  id: string;               // Unique ID (could be UUID or MongoDB ObjectId)
  title: string;            // Short title (e.g. "New Assignment Posted")
  message: string;          // Detailed message (e.g. "Math assignment due on Friday")
  type: "info" | "warning" | "success" | "error"; // For styling
  icon?: string;            // Optional icon (or use type-based icon)
  isRead: boolean;          // Whether user has seen it
  createdAt: string;        // ISO date string
  actionUrl?: string;       // Optional URL (e.g. /assignments/123)
};


export type User = {
  firstName: string;
  lastName: string;
  name: string;
  id: string;
  grade?: string;
  term: string;
  avatarUrl: string;
  classCategory?: string;
  courses: Course[];
  terms: Record<string, TermData>;
  setTerm: (term: string) => void;
};

//
// 2. Department Images (for dynamic department → image mapping)
//
export const departmentImages: Record<string, string> = {
  'Science Department': '/img/Algebra.svg',
  'Math Department': '/img/calculus.svg',
  'English Department': '/img/english.svg',
  'Arts Department': '/img/arts.svg',
};

export const fallbackDepartmentImage = '/img/default-department.png';

//
// 3. Context Setup
//
const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  // ✅ Keep term state separate so it can be updated independently
  const [term, setTerm] = useState('1st Term');

  // ✅ Everything else stays static
  const [user] = useState<Omit<User, 'term' | 'setTerm'>>({
    name: 'James Doe',
    firstName: 'James',
    lastName: 'Doe',
    id: 'TR092018',
    grade: 'Grade 7',
    avatarUrl: '/img/avatar.jpg',
    classCategory: 'Science',
    terms: {
      '1st Term': {
        attendance: { value: 300, maxValue: 500, label: 'Attendance' },
        position: { rank: '2nd', percentage: 65 },
      },
      '2nd Term': {
        attendance: { value: 400, maxValue: 500, label: 'Attendance' },
        position: { rank: '1st', percentage: 90 },
      },
      '3rd Term': {
        attendance: { value: 250, maxValue: 500, label: 'Attendance' },
        position: { rank: '3rd', percentage: 40 },
      },
    },
    courses: [
      {
        id: 1,
        subject: 'Advanced Chemistry',
        department: 'Science Department',
        teacher: 'Mr. Johnson Adebayo',
        icon: '',
      },
      {
        id: 2,
        subject: 'Algebra Fundamentals',
        department: 'Math Department',
        teacher: 'Mrs. Sarah Okonkwo',
        icon: '📐',
        iconBg: 'bg-blue-50',
      },
      {
        id: 3,
        subject: 'Physics Fundamentals',
        department: 'Science Department',
        teacher: 'Dr. Michael Emeka',
        icon: '⚛️',
        iconBg: 'bg-purple-50',
      },
      {
        id: 4,
        subject: 'Calculus Essentials',
        department: 'Math Department',
        teacher: 'Mrs. Sarah Okonkwo',
        icon: '📊',
        iconBg: 'bg-green-50',
      },
    ],
  });

  return (
    <UserContext.Provider value={{ ...user, term, setTerm }}>
      {children}
    </UserContext.Provider>
  );
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Assignment",
    message: "A new Math assignment is due Friday.",
    type: "info",
    isRead: false,
    createdAt: "2025-09-11T08:30:00Z",
    actionUrl: "/assignments/123",
  },
  {
    id: "2",
    title: "Result Published",
    message: "Your 2nd term results are now available.",
    type: "success",
    isRead: true,
    createdAt: "2025-09-09T12:00:00Z",
  },
  {
    id: "3",
    title: "Low Attendance",
    message: "Your attendance is below 60%. Please meet your class teacher.",
    type: "warning",
    isRead: false,
    createdAt: "2025-09-08T10:15:00Z",
  },
];


//
// 4. Hook for consuming user context
//
export const useUser = () => useContext(UserContext);
