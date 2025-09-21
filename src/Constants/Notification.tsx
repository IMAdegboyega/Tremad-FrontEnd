interface Notification {
  id: string;
  title: string;
  description: string;
  color: string;
  iconBg: string;
  isNew?: boolean;
}

export const notifications: Notification[] = [
    {
      id: '1',
      title: 'Your results are ready',
      description: 'View your results',
      color: 'bg-green-100',
      iconBg: 'bg-green-400',
      isNew: true
    },
    {
      id: '2',
      title: 'Upcoming test alert',
      description: 'Prepare for your English test on 23/04/2024',
      color: 'bg-red-100',
      iconBg: 'bg-red-400',
      isNew: false
    }
];