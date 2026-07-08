'use client';

/**
 * PaymentManagement — wired to real data.
 *
 * UI is identical to the mock version. Adapters at the top map API rows into
 * the legacy `PaymentRecord` / `StudentPayment` / `StudentPaymentData` shapes
 * that AllStudentsPayment and StudentPaymentDetail were built around, so
 * those subcomponents need no changes.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ListFilter, Download, ArrowRight } from 'lucide-react';
import AllStudentsPayment from '@/components/superadmin/PaymentManagement/AllStudentPayment';
import StudentPaymentDetail from '@/components/superadmin/PaymentManagement/StudentPaymentDetail';
import Image from 'next/image';
import {
  listSuperAdminPayments,
  getPaymentOverview,
  listStudentPayments,
  getStudentPaymentDetail,
  type SuperAdminPaymentRow,
  type SuperAdminStudentPaymentRow,
  type StudentPaymentDetail as StudentPaymentDetailApi,
  type PaymentOverview,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

// ============================================================================
// LEGACY COMPONENT SHAPES (kept verbatim so subcomponents aren't disturbed)
// ============================================================================

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

// ============================================================================
// FORMATTERS
// ============================================================================

/** Naira-formatted amount: `120000` → "₦120,000". */
const formatNaira = (n?: number): string => {
  if (n == null || Number.isNaN(n)) return '—';
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(
    n
  )}`;
};

const formatDateTwoLines = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  // The table parses on '\n' to render two lines — keep that contract.
  return `${date}\n${time.toUpperCase()}`;
};

const fullNameOf = (s: { firstName?: string; lastName?: string } | null) =>
  s
    ? `${toTitleCase(s.firstName)} ${toTitleCase(s.lastName)}`.trim() || '—'
    : '—';

/** Coerce the server's flexible status string into the legacy enum. */
const coerceDueStatus = (s: string): StudentPayment['status'] => {
  if (s === 'All Paid' || s === 'Due Today') return s;
  // The server returns labels like "5 Over due" — collapse to the legacy
  // values the UI styles ("2 Over due" / "3 Over due") for color purposes.
  if (/over due/i.test(s)) return '2 Over due';
  return 'Due Today';
};

// ============================================================================
// ADAPTERS
// ============================================================================

const toPaymentRecord = (p: SuperAdminPaymentRow): PaymentRecord => ({
  id: p._id,
  dateTime: formatDateTwoLines(p.paidAt || p.createdAt),
  name: fullNameOf(p.student),
  amount: formatNaira(p.amount),
  status: p.uiStatus === 'Refunded' ? 'Failed' : p.uiStatus,
  referenceNumber: p.transactionId || p.receiptNumber || '—',
});

const toStudentPayment = (s: SuperAdminStudentPaymentRow): StudentPayment => ({
  id: s._id,
  name: fullNameOf(s),
  balance: formatNaira(s.balance),
  status: coerceDueStatus(s.status),
  referenceNumber: s.referenceNumber || '—',
});

const toDueItem = (
  i: StudentPaymentDetailApi['dueItems'][number]
): DueItem => ({
  id: i._id,
  item: i.item,
  amount: formatNaira(i.amount),
  status: coerceDueStatus(i.status),
  dueDate: i.dueDate
    ? new Date(i.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—',
});

const toHistoryItem = (
  h: StudentPaymentDetailApi['history'][number]
): PaymentHistoryItem => ({
  id: h._id,
  item: h.item,
  amount: formatNaira(h.amount),
  status: h.uiStatus === 'Refunded' ? 'Failed' : h.uiStatus,
  referenceNumber: h.referenceNumber || '—',
  paymentMethod: h.paymentMethod || '—',
});

const toStudentDetail = (
  d: StudentPaymentDetailApi
): StudentPaymentData => ({
  studentId: d.student.admissionNumber || d.student._id,
  studentName: fullNameOf(d.student),
  grade: d.student.className || '—',
  dueItems: d.dueItems.map(toDueItem),
  paymentHistory: d.history.map(toHistoryItem),
});

// ============================================================================
// COMPONENT
// ============================================================================

const PaymentManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'allStudents' | 'studentDetail'
  >('dashboard');
  const [selectedStudent, setSelectedStudent] =
    useState<StudentPaymentData | null>(null);

  // --- Data ---
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [allStudentsData, setAllStudentsData] = useState<StudentPayment[]>([]);
  const [overview, setOverview] = useState<PaymentOverview | null>(null);

  // --- Loading flags (kept light — UI doesn't render skeletons here, so we
  //     just leave previous data in place during refetch.) ---
  const [historyLoading, setHistoryLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await listSuperAdminPayments({ page: 1, limit: 10 });
      if (res?.success && res.data) {
        setPaymentHistory((res.data.payments || []).map(toPaymentRecord));
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await getPaymentOverview();
      if (res?.success && res.data) setOverview(res.data);
    } catch {
      /* card values stay as last-loaded */
    }
  }, []);

  const fetchAllStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const res = await listStudentPayments({ page: 1, limit: 50 });
      if (res?.success && res.data) {
        setAllStudentsData((res.data.students || []).map(toStudentPayment));
      }
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // Dashboard view loads history + overview.
  useEffect(() => {
    fetchHistory();
    fetchOverview();
  }, [fetchHistory, fetchOverview]);

  // All-students view fetches lazily on entry.
  useEffect(() => {
    if (currentView === 'allStudents' && allStudentsData.length === 0) {
      fetchAllStudents();
    }
  }, [currentView, allStudentsData.length, fetchAllStudents]);

  const handleViewAllStudents = () => {
    setCurrentView('allStudents');
    // Force refetch on every entry so balances stay current.
    fetchAllStudents();
  };

  const handleViewStudentDetail = async (studentId: string) => {
    try {
      const res = await getStudentPaymentDetail(studentId);
      if (res?.success && res.data) {
        setSelectedStudent(toStudentDetail(res.data));
        setCurrentView('studentDetail');
      }
    } catch {
      /* swallow — UI stays on the all-students view */
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedStudent(null);
  };

  const handleBackToAllStudents = () => {
    setCurrentView('allStudents');
    setSelectedStudent(null);
  };

  const handleDownloadReport = () => {
    // Client-side CSV of the dashboard payment history page.
    if (paymentHistory.length === 0) return;
    const header = [
      'Date',
      'Time',
      'Name',
      'Amount',
      'Status',
      'Reference Number',
    ];
    const lines = paymentHistory.map((p) => {
      const [date, time] = p.dateTime.split('\n');
      return [date, time, p.name, p.amount, p.status, p.referenceNumber];
    });
    const csv = [header, ...lines]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // -- Subviews ----------------------------------------------------------------
  if (currentView === 'allStudents') {
    return (
      <AllStudentsPayment
        students={allStudentsData}
        onBack={handleBackToDashboard}
        onViewDetails={handleViewStudentDetail}
      />
    );
  }

  if (currentView === 'studentDetail' && selectedStudent) {
    return (
      <StudentPaymentDetail
        student={selectedStudent}
        onBack={handleBackToAllStudents}
      />
    );
  }

  // -- Dashboard view ----------------------------------------------------------
  const totalRevenueLabel = overview
    ? formatNaira(overview.totalRevenue.value)
    : '—';
  const todaysPaymentLabel = overview
    ? formatNaira(overview.todaysPayment.value)
    : '—';
  const outstandingLabel = overview
    ? formatNaira(overview.totalOutstanding.value)
    : '—';
  const failedCountLabel = overview
    ? overview.failedCount.value.toLocaleString()
    : '—';
  const revenueChange = overview?.totalRevenue.changePercent ?? 0;
  const outstandingChange = overview?.totalOutstanding.changePercent ?? 0;

  return (
    <div className='min-h-full bg-gray-50 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Payment management
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage your exam questions effectively.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50'>
            <ListFilter className='w-4 h-4' />
            First Term 2025
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={historyLoading || paymentHistory.length === 0}
            className='flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Download className='w-4 h-4' />
            Download report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white rounded-xl border border-gray-100 p-5'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>Total revenue</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {totalRevenueLabel}
              </p>
              <p
                className={`text-xs mt-1 ${
                  revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {revenueChange >= 0 ? '+' : ''}
                {revenueChange}% from last month
              </p>
            </div>
            <div className='rounded-lg flex items-center justify-center'>
              <Image
                src='/icon/paymentrevenue.svg'
                alt='Payment Revenue'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-100 p-5'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>Today&apos;s payment</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {todaysPaymentLabel}
              </p>
              <p className='text-xs text-green-600 mt-1'>Live total</p>
            </div>
            <div className='rounded-lg flex items-center justify-center'>
              <Image
                src='/icon/todayspayment.svg'
                alt='Todays Payment'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-100 p-5'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>Total outstanding</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {outstandingLabel}
              </p>
              <p
                className={`text-xs mt-1 ${
                  outstandingChange <= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {outstandingChange >= 0 ? '+' : ''}
                {outstandingChange}% from last month
              </p>
            </div>
            <div className='rounded-lg flex items-center justify-center'>
              <Image
                src='/icon/outstandingpayment.svg'
                alt='Total Outstanding'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-100 p-5'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>Failed payments</p>
              <p className='text-2xl font-semibold text-gray-900'>
                {failedCountLabel}
              </p>
              <p className='text-xs text-gray-500 mt-1'>To review</p>
            </div>
            <div className='rounded-lg flex items-center justify-center'>
              <Image
                src='/icon/outstandingpayment2.svg'
                alt='Failed payments'
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='mb-8 p-6 bg-white rounded-lg'>
        <h2 className='text-sm font-medium text-gray-700 mb-4'>
          Quick actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <button
            onClick={handleViewAllStudents}
            className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow'
          >
            <div className='flex items-center gap-3'>
              <div className='rounded-lg flex items-center justify-center'>
                <Image
                  src='/icon/paymentquickaction1.svg'
                  alt='All Student'
                  width={40}
                  height={40}
                />
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900'>All student</p>
                <p className='text-xs text-gray-500'>Manage payments</p>
              </div>
            </div>
            <ArrowRight className='w-4 h-4 text-gray-400' />
          </button>

          <button className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg flex items-center justify-center'>
                <Image
                  src='/icon/paymentquickaction2.svg'
                  alt='Receipts'
                  width={40}
                  height={40}
                />
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900'>Receipts</p>
                <p className='text-xs text-gray-500'>View all receipts</p>
              </div>
            </div>
            <ArrowRight className='w-4 h-4 text-gray-400' />
          </button>

          <button className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg flex items-center justify-center'>
                <Image
                  src='/icon/paymentquickaction3.svg'
                  alt='Thing 3'
                  width={40}
                  height={40}
                />
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900'>lorem ipsum</p>
                <p className='text-xs text-gray-500'>loremipsum</p>
              </div>
            </div>
            <ArrowRight className='w-4 h-4 text-gray-400' />
          </button>

          <button className='flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-shadow'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg flex items-center justify-center'>
                <Image
                  src='/icon/paymentquickaction4.svg'
                  alt='Thing 4'
                  width={40}
                  height={40}
                />
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900'>lorem ipsum</p>
                <p className='text-xs text-gray-500'>loremipsum</p>
              </div>
            </div>
            <ArrowRight className='w-4 h-4 text-gray-400' />
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className='bg-white rounded-xl border border-gray-100'>
        <div className='p-4'>
          <h2 className='text-base font-semibold text-gray-900'>
            Payment History
          </h2>
        </div>
        <div className='overflow-x-auto p-4'>
          <div className='rounded-xl overflow-hidden border'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-50 rounded-xl border-b border-gray-100'>
                  <th className='text-left text-xs font-medium text-gray-500 px-6 py-3'>
                    Date &amp; time
                  </th>
                  <th className='text-left text-xs font-medium text-gray-500 px-6 py-3'>
                    Name
                  </th>
                  <th className='text-left text-xs font-medium text-gray-500 px-6 py-3'>
                    Amount
                  </th>
                  <th className='text-left text-xs font-medium text-gray-500 px-6 py-3'>
                    Status
                  </th>
                  <th className='text-left text-xs font-medium text-gray-500 px-6 py-3'>
                    Reference number
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.length === 0 && !historyLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-6 py-12 text-center text-sm text-gray-500'
                    >
                      No payment activity yet.
                    </td>
                  </tr>
                ) : (
                  paymentHistory.map((payment) => {
                    // Per-status pill styling: light-tinted bg + matching dot.
                    const statusStyles =
                      payment.status === 'Success'
                        ? { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' }
                        : payment.status === 'Failed'
                        ? { pill: 'bg-red-50 text-red-700', dot: 'bg-red-500' }
                        : { pill: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' };
                    return (
                      <tr
                        key={payment.id}
                        className='border-b border-gray-50 hover:bg-gray-50'
                      >
                        <td className='px-6 py-4'>
                          <div className='text-sm text-gray-900'>
                            {payment.dateTime.split('\n')[0]}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {payment.dateTime.split('\n')[1]}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-900'>
                          {payment.name}
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-900'>
                          {payment.amount}
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles.pill}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}
                            />
                            {payment.status}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='inline-block px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600'>
                            {payment.referenceNumber}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
