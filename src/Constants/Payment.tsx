// file: src/Constants/Payment.tsx
import { CreditCard, DollarSign, FileText, Users } from "lucide-react";

export interface PaymentStat {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export interface Fee {
  id: string;
  title: string;
  amount: string;
  description: string;
  status?: 'Success' | 'Pending' | 'Failed';
  paymentDate?: string;
  referenceId?: string;
  isPaid?: boolean;
}

// Stats data - removed the activeTab dependency since it can't be used here
export const getStats = (activeTab?: string): PaymentStat[] => [
  {
    title: 'Total amount',
    value: '#100,000',
    icon: <DollarSign size={20} />,
    iconBg: 'bg-green-50',
    percentage: '+20.1% from last term'
  },
  {
    title: 'Total amount paid',
    value: '#30,000',
    subtitle: activeTab === 'supplementary' ? 'Supplementary fees' : activeTab === 'history' ? 'History' : '',
    icon: <CreditCard size={20} />,
    iconBg: 'bg-blue-50',
    percentage: '-20.1% from last term'
  },
  {
    title: 'Outstanding fees',
    value: '#70,000',
    icon: <FileText size={20} />,
    iconBg: 'bg-orange-50',
    subtitle: 'Dependent service',
    percentage: '-20.1% from last term'
  },
  {
    title: 'Number of fees',
    value: 9,
    icon: <Users size={20} />,
    iconBg: 'bg-purple-50',
    subtitle: '',
    percentage: '+20.1% from last term'
  }
];

// School fees data
export const schoolFees: Fee[] = [
  {
    id: '1',
    title: 'School party',
    amount: '#3,000',
    description: 'A yearly celebration with games, food, and performances'
  },
  {
    id: '2',
    title: 'Field Trip Expenses',
    amount: '#10,000',
    description: 'A music festival with live performances from various genres and artists',
    isPaid: true
  },
  {
    id: '3',
    title: 'Musical Instruments',
    amount: '#5,000',
    description: 'A cultural heritage festival celebrating diverse traditions and cuisines'
  },
  {
    id: '4',
    title: 'Textbooks',
    amount: '#30,000',
    description: 'An annual art exhibition showcasing local artists and their work',
    isPaid: true
  },
  {
    id: '5',
    title: 'Uniform Costs',
    amount: '#40,000',
    description: 'A health and wellness festival featuring workshops and fitness classes'
  },
  {
    id: '6',
    title: 'Technology Fees',
    amount: '#2,000',
    description: 'A community cleanup day focused on environmental sustainability',
    isPaid: true
  },
  {
    id: '7',
    title: 'Art Supplies',
    amount: '#3,000',
    description: 'A technology fair highlighting innovations and startups in the region'
  }
];

// Supplementary fees data
export const supplementaryFees: Fee[] = [
  {
    id: '1',
    title: 'Extra Classes',
    amount: '#15,000',
    description: 'Additional tutoring sessions for advanced subjects'
  },
  {
    id: '2',
    title: 'Sports Equipment',
    amount: '#8,000',
    description: 'Personal sports gear and team uniforms',
    isPaid: true
  },
  {
    id: '3',
    title: 'Laboratory Materials',
    amount: '#12,000',
    description: 'Advanced lab equipment and consumables for practical sessions'
  },
  {
    id: '4',
    title: 'Library Subscription',
    amount: '#5,000',
    description: 'Access to digital libraries and research databases',
    isPaid: true
  },
  {
    id: '5',
    title: 'Club Membership',
    amount: '#7,000',
    description: 'Membership fees for science, debate, and drama clubs'
  }
];

// Payment history data
export const paymentHistory: Fee[] = [
  {
    id: '1',
    title: 'School party',
    amount: '#3,000',
    paymentDate: '02-12-2024',
    status: 'Success',
    referenceId: 'AD56739918720E',
    description: ''
  },
  {
    id: '2',
    title: 'Field Trip Expenses',
    amount: '#10,000',
    paymentDate: '02-12-2024',
    status: 'Success',
    referenceId: 'AD56739918720E',
    description: ''
  },
  {
    id: '3',
    title: 'Musical Instruments',
    amount: '#5,000',
    paymentDate: '02-12-2024',
    status: 'Pending',
    referenceId: 'AD56739918720E',
    description: ''
  },
  {
    id: '4',
    title: 'Textbooks',
    amount: '#30,000',
    paymentDate: '02-12-2024',
    status: 'Failed',
    referenceId: 'AD56739918720E',
    description: ''
  },
  {
    id: '5',
    title: 'Uniform Costs',
    amount: '#40,000',
    paymentDate: '02-12-2024',
    status: 'Pending',
    referenceId: 'AD56739918720E',
    description: ''
  },
  {
    id: '6',
    title: 'Technology Fees',
    amount: '#2,000',
    paymentDate: '02-12-2024',
    status: 'Failed',
    referenceId: 'AD56739918720E',
    description: ''
  },
  {
    id: '7',
    title: 'Art Supplies',
    amount: '#3,000',
    paymentDate: '02-12-2024',
    status: 'Success',
    referenceId: 'AD56739918720E',
    description: ''
  }
];

export const termOptions = [
  { value: 'current', label: 'Current term' },
  { value: '1st', label: '1st Term' },
  { value: '2nd', label: '2nd Term' },
  { value: '3rd', label: '3rd Term' }
];

export const getStatusColor = (status: string) => {
  switch(status) {
    case 'Success': return 'text-green-600';
    case 'Pending': return 'text-yellow-600';
    case 'Failed': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getStatusDot = (status: string) => {
  switch(status) {
    case 'Success': return 'bg-green-500';
    case 'Pending': return 'bg-yellow-500';
    case 'Failed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};