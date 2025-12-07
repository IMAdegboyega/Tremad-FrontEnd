'use client'

import React, { useState } from 'react';
import { ListFilter, Download, ArrowRight } from 'lucide-react';
import AllStudentsPayment from '@/components/superadmin/PaymentManagement/AllStudentPayment';
import StudentPaymentDetail from '@/components/superadmin/PaymentManagement/StudentPaymentDetail';
import Image from 'next/image';

// Types
export interface PaymentRecord {
  id: string;
  dateTime: string;
  name: string;
  amount: string;
  status: 'Success' | 'Failed' | 'Pending';
  referenceNumber: string;
}

export interface StudentPayment {
  id: string;
  name: string;
  balance: string;
  status: 'All Paid' | 'Due Today' | '2 Over due' | '3 Over due';
  referenceNumber: string;
  paymentMethod?: string;
}

export interface DueItem {
  id: string;
  item: string;
  amount: string;
  status: 'All Paid' | 'Due Today' | '2 Over due' | '3 Over due';
  dueDate: string;
}

export interface PaymentHistoryItem {
  id: string;
  item: string;
  amount: string;
  status: 'Success' | 'Failed' | 'Pending';
  referenceNumber: string;
  paymentMethod: string;
}

export interface StudentPaymentData {
  studentId: string;
  studentName: string;
  grade: string;
  dueItems: DueItem[];
  paymentHistory: PaymentHistoryItem[];
}

const PaymentManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'allStudents' | 'studentDetail'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<StudentPaymentData | null>(null);

  // Sample payment history data
  const paymentHistory: PaymentRecord[] = [
    { id: '1', dateTime: '12 Aug 2024\n09:27 AM', name: 'Alice Smith', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
    { id: '2', dateTime: '12 Aug 2024\n09:27 AM', name: 'Michael Johnson', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
    { id: '3', dateTime: '12 Aug 2024\n09:27 AM', name: 'Emily Davis', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
    { id: '4', dateTime: '12 Aug 2024\n09:27 AM', name: 'James Garcia', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
    { id: '5', dateTime: '12 Aug 2024\n09:27 AM', name: 'David Brown', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
    { id: '6', dateTime: '12 Aug 2024\n09:27 AM', name: 'Olivia Martinez', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
    { id: '7', dateTime: '12 Aug 2024\n09:27 AM', name: 'Sophia Wilson', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789' },
  ];

  // Sample all students data
  const allStudentsData: StudentPayment[] = [
    { id: '1', name: 'Alice Smith', balance: '₦120,000', status: '2 Over due', referenceNumber: 'TRXT123456789' },
    { id: '2', name: 'David Brown', balance: '₦120,000', status: 'All Paid', referenceNumber: 'TRXT123456789' },
    { id: '3', name: 'Frank Wilson', balance: '₦120,000', status: 'Due Today', referenceNumber: 'TRXT123456789' },
    { id: '4', name: 'Eva Martinez', balance: '₦120,000', status: '2 Over due', referenceNumber: 'TRXT123456789' },
    { id: '5', name: 'Alice Smith', balance: '₦120,000', status: 'Due Today', referenceNumber: 'TRXT123456789' },
    { id: '6', name: 'Bob Johnson', balance: '₦120,000', status: 'All Paid', referenceNumber: 'TRXT123456789' },
    { id: '7', name: 'Catherine Lee', balance: '₦120,000', status: 'All Paid', referenceNumber: 'TRXT123456789' },
  ];

  // Sample student detail data
  const getStudentDetail = (studentId: string): StudentPaymentData => {
    return {
      studentId: 'STU001',
      studentName: 'John Doe',
      grade: 'Grade 11',
      dueItems: [
        { id: '1', item: 'September Tuition', amount: '₦120,000', status: '2 Over due', dueDate: 'Aug 12th, 2025' },
        { id: '2', item: 'Soccer Team Fee', amount: '₦120,000', status: 'All Paid', dueDate: 'Aug 12th, 2025' },
        { id: '3', item: 'Science Lab Fee', amount: '₦120,000', status: 'Due Today', dueDate: 'Aug 12th, 2025' },
        { id: '4', item: 'Cultural day fee', amount: '₦120,000', status: '2 Over due', dueDate: 'Aug 12th, 2025' },
      ],
      paymentHistory: [
        { id: '1', item: 'September Tuition', amount: '₦120,000', status: 'Failed', referenceNumber: 'TRXT123456789', paymentMethod: '₦120,000' },
        { id: '2', item: 'Soccer Team Fee', amount: '₦120,000', status: 'Success', referenceNumber: 'TRXT123456789', paymentMethod: '₦120,000' },
        { id: '3', item: 'Science Lab Fee', amount: '₦120,000', status: 'Pending', referenceNumber: 'TRXT123456789', paymentMethod: '₦120,000' },
        { id: '4', item: 'Eva Martinez', amount: '₦120,000', status: '2 Over due' as any, referenceNumber: 'TRXT123456789', paymentMethod: '₦120,000' },
      ],
    };
  };

  // Handlers
  const handleViewAllStudents = () => {
    setCurrentView('allStudents');
  };

  const handleViewStudentDetail = (studentId: string) => {
    const studentData = getStudentDetail(studentId);
    setSelectedStudent(studentData);
    setCurrentView('studentDetail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedStudent(null);
  };

  const handleBackToAllStudents = () => {
    setCurrentView('allStudents');
    setSelectedStudent(null);
  };

  // Render All Students view
  if (currentView === 'allStudents') {
    return (
      <AllStudentsPayment
        students={allStudentsData}
        onBack={handleBackToDashboard}
        onViewDetails={handleViewStudentDetail}
      />
    );
  }

  // Render Student Detail view
  if (currentView === 'studentDetail' && selectedStudent) {
    return (
      <StudentPaymentDetail
        student={selectedStudent}
        onBack={handleBackToAllStudents}
      />
    );
  }

  // Render Dashboard view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payment management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your exam questions effectively.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ListFilter className="w-4 h-4" />
            First Term 2025
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Download className="w-4 h-4" />
            Download report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₦120,000,000</p>
              <p className="text-xs text-green-600 mt-1">+20.1% from last term</p>
            </div>
            <div className="rounded-lg flex items-center justify-center">
              <Image
                src="/icon/paymentrevenue.svg"
                alt='Payment Revenue'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Today's payment</p>
              <p className="text-2xl font-semibold text-gray-900">24.8 MB</p>
              <p className="text-xs text-red-600 mt-1">-20.1% from last term</p>
            </div>
            <div className="rounded-lg flex items-center justify-center">
              <Image
                src="/icon/todayspayment.svg"
                alt='Todays Payment'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total outstanding</p>
              <p className="text-2xl font-semibold text-gray-900">₦7580,000</p>
              <p className="text-xs text-green-600 mt-1">+20.1% from last term</p>
            </div>
            <div className="rounded-lg flex items-center justify-center">
              <Image
                src="/icon/outstandingpayment.svg"
                alt='Total Outstanding'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Outstanding</p>
              <p className="text-2xl font-semibold text-gray-900">₦7580,000</p>
              <p className="text-xs text-green-600 mt-1">+20.1% from last term</p>
            </div>
            <div className="rounded-lg flex items-center justify-center">
              <Image
                src="/icon/outstandingpayment2.svg"
                alt='Total Outstanding'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 p-6 bg-white rounded-lg">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleViewAllStudents}
            className="flex items-center justify-between p-4  bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg flex items-center justify-center">
                <Image
                  src="/icon/paymentquickaction1.svg"
                  alt='All Student'
                  width={40}
                  height={40}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">All student</p>
                <p className="text-xs text-gray-500">Manage payments</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="rounded-lg flex items-center justify-center">
                <Image
                  src="/icon/paymentquickaction2.svg"
                  alt='Receipts'
                  width={40}
                  height={40}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Receipts</p>
                <p className="text-xs text-gray-500">View all receipts</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="rounded-lg flex items-center justify-center">
                <Image
                  src="/icon/paymentquickaction3.svg"
                  alt='Thing 3'
                  width={40}
                  height={40}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">lorem ipsum</p>
                <p className="text-xs text-gray-500">loremipsum</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button className="flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="rounded-lg flex items-center justify-center">
                <Image
                  src="/icon/paymentquickaction4.svg"
                  alt='Thing 4'
                  width={40}
                  height={40}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">lorem ipsum</p>
                <p className="text-xs text-gray-500">loremipsum</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4">
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <div className='rounded-xl overflow-hidden border'>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 rounded-xl border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date & time</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Reference number</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{payment.dateTime.split('\n')[0]}</div>
                      <div className="text-xs text-gray-500">{payment.dateTime.split('\n')[1]}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        payment.status === 'Success' ? 'text-green-600' :
                        payment.status === 'Failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          payment.status === 'Success' ? 'bg-green-600' :
                          payment.status === 'Failed' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }`} />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.referenceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;