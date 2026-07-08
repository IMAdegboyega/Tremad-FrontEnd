// file: src/Constants/Payment.tsx
//
// Pure display helpers for the payment UI. Historical mock data has been
// removed in favor of API-backed payments.

export const termOptions = [
  { value: 'current', label: 'Current term' },
  { value: '1st', label: '1st Term' },
  { value: '2nd', label: '2nd Term' },
  { value: '3rd', label: '3rd Term' },
];

/**
 * Map a status string to a text color utility class.
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'Success':
      return 'text-green-600';
    case 'pending':
    case 'Pending':
      return 'text-yellow-600';
    case 'failed':
    case 'Failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Map a status string to a background-color utility class for the status dot.
 */
export const getStatusDot = (status: string) => {
  switch (status) {
    case 'paid':
    case 'Success':
      return 'bg-green-500';
    case 'pending':
    case 'Pending':
      return 'bg-yellow-500';
    case 'failed':
    case 'Failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Present a backend status as a titlecased label.
 */
export const formatStatusLabel = (status?: string): string => {
  if (!status) return '—';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

/**
 * Simple Naira formatter. Keeps integer amounts compact and comma-separated.
 */
export const formatAmount = (amount: number | undefined | null): string => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `₦${Number(amount).toLocaleString('en-NG')}`;
};
