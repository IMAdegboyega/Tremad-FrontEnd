import { BookOpen, Calendar, FileText, Trophy } from "lucide-react";

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

export const stats: StatCard[] = [
    {
      id: '1',
      title: 'Total subjects',
      value: 10,
      change: +20.1,
      changeLabel: 'from last term',
      icon: <BookOpen size={20} />,
    },
    {
      id: '2',
      title: 'Class position',
      value: '-',
      change: -20.1,
      changeLabel: 'from last term',
      icon: <Trophy size={20} />,
    },
    {
      id: '3',
      title: 'Overall attendance',
      value: '90%',
      change: -20.1,
      changeLabel: 'from last term',
      icon: <Calendar size={20} />,
    },
    {
      id: '4',
      title: 'Pending assignment',
      value: 12,
      change: +20.1,
      changeLabel: 'from last term',
      icon: <FileText size={20} />,
    }
  ];