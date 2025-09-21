import { BookOpen, Calculator, Computer, FlaskConical, Home, Pencil } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  room: string;
  teacher: string;
  type: string;
  assignment: 'Submitted' | 'Pending';
  schedule: string;
  icon: React.ReactNode;
  iconBg: string;
  department?: string;
}

export const subjects: Subject[] = [
    {
      id: '1',
      name: 'Mathematics',
      room: 'Block A, Room 12',
      teacher: 'Mr. Johnson Adebayo',
      type: 'No practical',
      assignment: 'Submitted',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      icon: <Calculator size={20} />,
      iconBg: 'bg-blue-100'
    },
    {
      id: '2',
      name: 'English Language',
      room: 'Block B, Room 8',
      teacher: 'Mrs. Sarah Okonkwo',
      type: 'Phonics',
      assignment: 'Pending',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      icon: <BookOpen size={20} />,
      iconBg: 'bg-green-100'
    },
    {
      id: '3',
      name: 'Chemistry',
      room: 'Basic Science',
      teacher: 'Dr. Michael Emeka',
      type: 'Practical available',
      assignment: 'Submitted',
      schedule: 'Tue, Thu - 11:00 AM',
      icon: <FlaskConical size={20} />,
      iconBg: 'bg-purple-100',
      department: 'Basic Science'
    },
    {
      id: '4',
      name: 'Computer Studies',
      room: 'Computer Lab',
      teacher: 'Dr. Michael Emeka',
      type: 'Practical available',
      assignment: 'Pending',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      icon: <Computer size={20} />,
      iconBg: 'bg-cyan-100'
    },
    {
      id: '5',
      name: 'Home economics',
      room: 'Math Department',
      teacher: 'Mr. Johnson Adebayo',
      type: 'Practical available',
      assignment: 'Submitted',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      icon: <Home size={20} />,
      iconBg: 'bg-orange-100',
      department: 'Math Department'
    },
    {
      id: '6',
      name: 'Technical drawing',
      room: 'Block A, Room 12',
      teacher: 'Dr. Michael Emeka',
      type: 'Practical',
      assignment: 'Submitted',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      icon: <Pencil size={20} />,
      iconBg: 'bg-pink-100'
    },
    {
      id: '7',
      name: 'Mathematics',
      room: 'Block A, Room 12',
      teacher: 'Mrs. Sarah Okonkwo',
      type: 'No practical',
      assignment: 'Submitted',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      icon: <Calculator size={20} />,
      iconBg: 'bg-blue-100'
    }
  ];