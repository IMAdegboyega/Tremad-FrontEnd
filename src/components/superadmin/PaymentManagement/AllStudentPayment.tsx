'use client'

import React, { useState } from 'react';
import { Search, ListFilter, Download, EllipsisVertical, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StudentPayment } from '@/app/SuperAdmin/(root)/[section]/sections/PaymentManagement';

interface AllStudentsPaymentProps {
  students: StudentPayment[];
  onBack: () => void;
  onViewDetails: (studentId: string) => void;
}

const AllStudentsPayment: React.FC<AllStudentsPaymentProps> = ({
  students,
  onBack,
  onViewDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /**
   * Pill style per due-status, matching the design mock:
   *   - All Paid    → green pill, green dot, green text
   *   - Due Today   → yellow pill, yellow dot, yellow text
   *   - Over due (any duration) → red/pink pill, red dot, red text
   *
   * Returns both the pill background+text classes and the dot color so the
   * cell can stay declarative.
   */
  const getStatusStyle = (status: string) => {
    if (status === 'All Paid') {
      return { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' };
    }
    if (status === 'Due Today') {
      return { pill: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' };
    }
    if (/over due/i.test(status)) {
      return { pill: 'bg-red-50 text-red-700', dot: 'bg-red-500' };
    }
    return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  };

  return (
    <div className="min-h-full bg-gray-50 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 md:mb-4 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">All Students Payment Status</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your exam questions effectively.</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover min-h-[44px]">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download report</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-h-[44px]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white min-h-[44px]">
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

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Balance</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Reference number</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Payment method</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const statusStyles = getStatusStyle(student.status);
                  return (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{student.name}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{student.balance}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                        {student.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 truncate max-w-[160px]">{student.referenceNumber}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <EllipsisVertical size={20} />
                          </button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(student.id)}>
                          <span className="cursor-pointer">View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Send Reminder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Download Receipt</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-6 py-12 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AllStudentsPayment;