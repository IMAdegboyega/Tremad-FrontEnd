'use client'

import React, { useState } from 'react';
import { Search, ListFilter, Download, EllipsisVertical, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StudentPaymentData } from '@/app/SuperAdmin/(root)/[section]/sections/PaymentManagement';

interface StudentPaymentDetailProps {
  student: StudentPaymentData;
  onBack: () => void;
}

const StudentPaymentDetail: React.FC<StudentPaymentDetailProps> = ({
  student,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  /**
   * Pill styling shared by both tables on this page. Returns the pill
   * background + text classes together with the dot color, so the row
   * cells stay one-liner declarative.
   *
   * Green:  All Paid / Success
   * Yellow: Due Today / Pending
   * Red:    Failed + any "Over due" variant (1 / 2 / 5 days, regex-matched)
   */
  const getStatusStyle = (status: string) => {
    if (status === 'All Paid' || status === 'Success') {
      return { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' };
    }
    if (status === 'Due Today' || status === 'Pending') {
      return { pill: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' };
    }
    if (status === 'Failed' || /over due/i.test(status)) {
      return { pill: 'bg-red-50 text-red-700', dot: 'bg-red-500' };
    }
    return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  };

  return (
    <div className="min-h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {student.studentName} ({student.studentId}) - {student.grade}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your exam questions effectively.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover">
            <Download className="w-4 h-4" />
            Download report
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name , email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
              <ListFilter className="w-4 h-4" />
              Filter by status
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              <span className="cursor-pointer">All Status</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('All Paid')}>
              <span className="cursor-pointer">All Paid</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Due Today')}>
              <span className="cursor-pointer">Due Today</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('2 Over due')}>
              <span className="cursor-pointer">Over Due</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* What's Due Section */}
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-900">What's Due</h2>
        </div>
        {/* Inner rounded wrapper — gives the table its own framed look with the
            gray header strip clipped to rounded corners. Matches the Receipts
            page styling. */}
        <div className="overflow-x-auto p-4 pt-0">
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Item</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {student.dueItems.map((item) => {
                const styles = getStatusStyle(item.status);
                return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.dueDate}</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisVertical size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Mark as Paid</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Send Reminder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Extend Due Date</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto p-4 pt-0">
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Item</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Reference number</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Payment method</th>
              </tr>
            </thead>
            <tbody>
              {student.paymentHistory.map((payment) => {
                const styles = getStatusStyle(payment.status);
                return (
                <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 truncate max-w-[160px]">{payment.referenceNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.paymentMethod}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentDetail;