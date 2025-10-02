import { Award, BookOpen, Target, Users } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

interface SubjectResult {
  id: string;
  subject: string;
  teacher: string;
  score: number;
  grade: string;
  gradeColor: string;
  position: string;
  positionColor: string;
  remark: string;
}

export const stats: StatCard[] = [
    {
      title: 'Overall position',
      value: '5th',
      change: +20.1,
      changeLabel: 'from last term',
      icon: <Award size={20} />
    },
    {
      title: 'Percentage',
      value: '-',
      change: -20.1,
      changeLabel: 'from last term',
      icon: <Target size={20} />
    },
    {
      title: 'Total score obtained',
      value: '90%',
      change: -20.1,
      changeLabel: 'from last term',
      icon: <BookOpen size={20} />
    },
    {
      title: 'Total students in class',
      value: 42,
      change: +20.1,
      changeLabel: 'from last term',
      icon: <Users size={20} />
    }
];

  // Subject results data
export const subjectResults: SubjectResult[] = [
    {
      id: '1',
      subject: 'Mathematics',
      teacher: 'Mr. Johnson Adebayo',
      score: 85,
      grade: 'A',
      gradeColor: 'bg-green-100 text-green-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Excellent work'
    },
    {
      id: '2',
      subject: 'English Language',
      teacher: 'Mrs. Sarah Okonkwo',
      score: 85,
      grade: 'B',
      gradeColor: 'bg-purple-100 text-purple-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Good progress'
    },
    {
      id: '3',
      subject: 'Science Lab 1',
      teacher: 'Dr. Michael Emeka',
      score: 85,
      grade: 'C',
      gradeColor: 'bg-blue-100 text-blue-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Good effort'
    },
    {
      id: '4',
      subject: 'Computer Studies',
      teacher: 'Dr. Michael Emeka',
      score: 85,
      grade: 'B',
      gradeColor: 'bg-purple-100 text-purple-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Needs improvement'
    },
    {
      id: '5',
      subject: 'Calculus Essentials',
      teacher: 'Mr. Johnson Adebayo',
      score: 85,
      grade: 'A',
      gradeColor: 'bg-green-100 text-green-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Satisfactory'
    },
    {
      id: '6',
      subject: 'Calculus Essentials',
      teacher: 'Dr. Michael Emeka',
      score: 85,
      grade: 'B',
      gradeColor: 'bg-purple-100 text-purple-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Excellent work'
    },
    {
      id: '7',
      subject: 'Calculus Essentials',
      teacher: 'Mrs. Sarah Okonkwo',
      score: 85,
      grade: 'A',
      gradeColor: 'bg-green-100 text-green-700',
      position: '#3rd',
      positionColor: 'text-yellow-600',
      remark: 'Good progress'
    }
];