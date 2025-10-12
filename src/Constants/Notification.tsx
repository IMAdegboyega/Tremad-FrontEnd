export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'project' | 'assignment' | 'announcement' | 'grade' | 'attendance';
  read: boolean;
  iconBg?: string;
}

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'You received a proposal on project 2',
    description: 'Check your project dashboard for the new proposal from your team member.',
    date: new Date('2023-03-15T09:30:00'),
    type: 'project',
    read: false,
    iconBg: 'bg-blue-100'
  },
  {
    id: '2',
    title: 'You received a proposal on project 2',
    description: 'New updates available for review in your project workspace.',
    date: new Date('2023-03-15T08:45:00'),
    type: 'project',
    read: false,
    iconBg: 'bg-blue-100'
  },
  {
    id: '3',
    title: 'You received a proposal on project 2',
    description: 'Team collaboration request pending your approval.',
    date: new Date('2023-03-15T07:20:00'),
    type: 'project',
    read: true,
    iconBg: 'bg-blue-100'
  },
  {
    id: '4',
    title: 'You received a proposal on project 2',
    description: 'Important deadline reminder for your ongoing project.',
    date: new Date('2023-03-15T06:15:00'),
    type: 'project',
    read: true,
    iconBg: 'bg-blue-100'
  },
  {
    id: '5',
    title: 'You received a proposal on project 2',
    description: 'New resources have been added to your project folder.',
    date: new Date('2023-03-14T16:30:00'),
    type: 'project',
    read: true,
    iconBg: 'bg-blue-100'
  },
  {
    id: '6',
    title: 'Assignment Due: Mathematics Homework',
    description: 'Your mathematics assignment is due tomorrow at 11:59 PM.',
    date: new Date('2023-03-14T14:00:00'),
    type: 'assignment',
    read: true,
    iconBg: 'bg-orange-100'
  },
  {
    id: '7',
    title: 'Grade Posted: Science Mid-term',
    description: 'Your science mid-term exam has been graded. View your results.',
    date: new Date('2023-03-14T10:30:00'),
    type: 'grade',
    read: true,
    iconBg: 'bg-green-100'
  },
  {
    id: '8',
    title: 'School Announcement: Parent-Teacher Meeting',
    description: 'Reminder: Parent-teacher meeting scheduled for next Friday.',
    date: new Date('2023-03-13T09:00:00'),
    type: 'announcement',
    read: true,
    iconBg: 'bg-purple-100'
  }
];

// Helper function to format notification dates
export const formatNotificationDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
};

// Helper to get grouped notifications
export const getGroupedNotifications = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    today: notifications.filter(n => n.date >= today),
    yesterday: notifications.filter(n => n.date >= yesterday && n.date < today),
    older: notifications.filter(n => n.date < yesterday)
  };
};