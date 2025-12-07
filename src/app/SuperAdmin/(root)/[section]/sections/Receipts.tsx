'use client'

import React, { useState } from 'react';
import { Search, ListFilter, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react';
import ReceiptDetail from '@/components/superadmin/Receipts/ReceiptDetail';
import DownloadReceipt from '@/components/superadmin/Receipts/DownloadReceipt';

export interface Receipt {
  id: string;
  receiptNo: string;
  studentName: string;
  studentId: string;
  paymentType: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Refunded' | 'Pending';
  // Additional details for receipt template
  grade?: string;
  parent?: string;
  transactionId?: string;
  paymentMethod?: string;
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  id: number;
  description: string;
  amount: number;
}

const Receipts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Refunded' | 'Pending'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const itemsPerPage = 8;

  // Sample data
  const receipts: Receipt[] = [
    {
      id: '1',
      receiptNo: 'RCP001',
      studentName: 'Alice Smith',
      studentId: 'STU001',
      paymentType: 'Tuition',
      amount: '₦120,000',
      date: 'Sep 20',
      status: 'Paid',
      grade: '11 - Computer Science',
      parent: 'John Doe',
      transactionId: 'TXN123456789',
      paymentMethod: 'Credit Card',
      items: [
        { id: 1, description: 'September Tuition', amount: 130000.00 },
        { id: 2, description: 'Processing Fee', amount: 196000.00 },
      ]
    },
    {
      id: '2',
      receiptNo: 'RCP002',
      studentName: 'Michael Johnson',
      studentId: 'STU002',
      paymentType: 'Lunch Fee',
      amount: '₦120,000',
      date: 'Sep 19',
      status: 'Paid',
      grade: '10 - Science',
      parent: 'Sarah Johnson',
      transactionId: 'TXN123456790',
      paymentMethod: 'Bank Transfer',
      items: [
        { id: 1, description: 'Lunch Fee - Term 1', amount: 120000.00 },
      ]
    },
    {
      id: '3',
      receiptNo: 'RCP003',
      studentName: 'Emily Davis',
      studentId: 'STU003',
      paymentType: 'Sports Fee',
      amount: '₦120,000',
      date: 'Sep 19',
      status: 'Refunded',
      grade: '9 - Arts',
      parent: 'Mark Davis',
      transactionId: 'TXN123456791',
      paymentMethod: 'Credit Card',
      items: [
        { id: 1, description: 'Sports Fee - Annual', amount: 120000.00 },
      ]
    },
    {
      id: '4',
      receiptNo: 'RCP004',
      studentName: 'James Garcia',
      studentId: 'STU004',
      paymentType: 'Lab Fee',
      amount: '₦120,000',
      date: 'Sep 20',
      status: 'Paid',
      grade: '12 - Science',
      parent: 'Maria Garcia',
      transactionId: 'TXN123456792',
      paymentMethod: 'Cash',
      items: [
        { id: 1, description: 'Lab Fee - Chemistry', amount: 60000.00 },
        { id: 2, description: 'Lab Fee - Physics', amount: 60000.00 },
      ]
    },
    {
      id: '5',
      receiptNo: 'RCP005',
      studentName: 'David Brown',
      studentId: 'STU005',
      paymentType: 'Transport',
      amount: '₦120,000',
      date: 'Sep 19',
      status: 'Refunded',
      grade: '8 - General',
      parent: 'Lisa Brown',
      transactionId: 'TXN123456793',
      paymentMethod: 'Bank Transfer',
      items: [
        { id: 1, description: 'Transport Fee - Term 1', amount: 120000.00 },
      ]
    },
    {
      id: '6',
      receiptNo: 'RCP006',
      studentName: 'Olivia Martinez',
      studentId: 'STU006',
      paymentType: 'Sports Fee',
      amount: '₦120,000',
      date: 'Sep 19',
      status: 'Paid',
      grade: '11 - Commercial',
      parent: 'Carlos Martinez',
      transactionId: 'TXN123456794',
      paymentMethod: 'Credit Card',
      items: [
        { id: 1, description: 'Sports Fee - Annual', amount: 120000.00 },
      ]
    },
    {
      id: '7',
      receiptNo: 'RCP007',
      studentName: 'Sophia Wilson',
      studentId: 'STU007',
      paymentType: 'Lunch Fee',
      amount: '₦120,000',
      date: 'Sep 30',
      status: 'Refunded',
      grade: '10 - Arts',
      parent: 'Tom Wilson',
      transactionId: 'TXN123456795',
      paymentMethod: 'Cash',
      items: [
        { id: 1, description: 'Lunch Fee - Term 1', amount: 120000.00 },
      ]
    },
    {
      id: '8',
      receiptNo: 'RCP008',
      studentName: 'Sophia Wilson',
      studentId: 'STU007',
      paymentType: 'Lunch Fee',
      amount: '₦120,000',
      date: 'Sep 30',
      status: 'Paid',
      grade: '10 - Arts',
      parent: 'Tom Wilson',
      transactionId: 'TXN123456796',
      paymentMethod: 'Credit Card',
      items: [
        { id: 1, description: 'Lunch Fee - Term 2', amount: 120000.00 },
      ]
    },
    {
      id: '9',
      receiptNo: 'RCP009',
      studentName: 'Sophia Wilson',
      studentId: 'STU007',
      paymentType: 'Lunch Fee',
      amount: '₦120,000',
      date: 'Sep 30',
      status: 'Paid',
      grade: '10 - Arts',
      parent: 'Tom Wilson',
      transactionId: 'TXN123456797',
      paymentMethod: 'Bank Transfer',
      items: [
        { id: 1, description: 'Lunch Fee - Term 3', amount: 120000.00 },
      ]
    },
  ];

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  // Generate page numbers
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  const handleBackToList = () => {
    setSelectedReceipt(null);
  };

  const getStatusStyles = (status: Receipt['status']) => {
    switch (status) {
      case 'Paid':
        return 'text-green-600';
      case 'Refunded':
        return 'text-yellow-600';
      case 'Pending':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  // Show receipt detail view
  if (selectedReceipt) {
    return (
      <ReceiptDetail
        receipt={selectedReceipt}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your exam questions effectively</p>
        </div>
        <button className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download report
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, email or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
          <ListFilter className="w-4 h-4" />
          Filter by status
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
          <ListFilter className="w-4 h-4" />
          Filter by grade
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
          <ListFilter className="w-4 h-4" />
          Filter by status
        </button>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Receipt</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Student</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Payment Type</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReceipts.length > 0 ? (
              currentReceipts.map((receipt) => (
                <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{receipt.receiptNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{receipt.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{receipt.paymentType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{receipt.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{receipt.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getStatusStyles(receipt.status)}`}>
                      • {receipt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewReceipt(receipt)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No receipts found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredReceipts.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={typeof page !== 'number'}
                  className={`min-w-[32px] h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-green-600 text-white font-medium'
                      : typeof page === 'number'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipts;