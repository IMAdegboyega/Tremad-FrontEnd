'use client';

/**
 * Receipts — wired to real data.
 *
 * Receipts are completed payments. We hit listSuperAdminPayments with
 * status filter set, then adapt each row into the legacy `Receipt` shape
 * the table + ReceiptDetail + DownloadReceipt components already use.
 *
 * Download itself stays where it was — DownloadReceipt renders the receipt
 * to a DOM node and html2canvas + jsPDF turn it into a PDF client-side.
 * The Receipt object we pass through carries everything that template
 * already reads from (`items`, `paymentMethod`, `parent`, `grade`, etc.).
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReceiptDetail from '@/components/superadmin/Receipts/ReceiptDetail';
import {
  listSuperAdminPayments,
  type SuperAdminPaymentRow,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

// ============================================================================
// LEGACY COMPONENT SHAPES (unchanged)
// ============================================================================

export interface Receipt {
  id: string;
  receiptNo: string;
  studentName: string;
  studentId: string;
  paymentType: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Refunded' | 'Pending';
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

// ============================================================================
// HELPERS
// ============================================================================

const PAGE_SIZE = 8;

const formatNaira = (n?: number) =>
  n == null
    ? '—'
    : `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(n)}`;

const formatShortDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '—';

const paymentTypeLabel = (t: string) => {
  // Capitalize for display ("tuition" → "Tuition").
  if (!t) return '—';
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const paymentMethodLabel = (m: string) => {
  switch (m) {
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'card':
      return 'Credit Card';
    case 'online':
      return 'Online Payment';
    case 'cash':
      return 'Cash';
    default:
      return m || '—';
  }
};

const statusLabel = (
  s: SuperAdminPaymentRow['status']
): Receipt['status'] => {
  if (s === 'completed') return 'Paid';
  if (s === 'refunded') return 'Refunded';
  return 'Pending';
};

/** Use a debounced version of `value` so we don't refetch on every keystroke. */
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const toReceipt = (p: SuperAdminPaymentRow): Receipt => {
  const studentName = p.student
    ? `${toTitleCase(p.student.firstName)} ${toTitleCase(
        p.student.lastName
      )}`.trim() || p.student.email || '—'
    : '—';

  return {
    id: p._id,
    receiptNo: p.receiptNumber || `RCP${p._id.slice(-6).toUpperCase()}`,
    studentName,
    studentId: p.student?.admissionNumber || p.student?._id || '—',
    paymentType: paymentTypeLabel(p.paymentType),
    amount: formatNaira(p.amount),
    date: formatShortDate(p.paidAt || p.createdAt),
    status: statusLabel(p.status),
    grade: p.student?.className || '—',
    parent: p.student?.guardianName || '—',
    transactionId: p.transactionId || p.receiptNumber || '—',
    paymentMethod: paymentMethodLabel(p.paymentMethod),
    items: [
      {
        id: 1,
        description: p.description || paymentTypeLabel(p.paymentType),
        amount: p.amount,
      },
    ],
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

const Receipts: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Paid' | 'Refunded' | 'Pending'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const [rows, setRows] = useState<Receipt[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  // Reset to page 1 whenever filters/search change.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetch = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    try {
      // Map the UI filter to the backend status value.
      const backendStatus =
        statusFilter === 'Paid'
          ? 'completed'
          : statusFilter === 'Refunded'
          ? 'refunded'
          : statusFilter === 'Pending'
          ? 'pending'
          : undefined;

      const res = await listSuperAdminPayments({
        status: backendStatus,
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      if (res?.success && res.data) {
        setRows((res.data.payments || []).map(toReceipt));
        const tp = res.data.pagination?.totalPages ?? 1;
        setTotalPages(tp);
        if (tp > 0 && currentPage > tp) setCurrentPage(tp);
      } else {
        setErrored(true);
      }
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // ----- Pagination row -----
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDownloadAll = () => {
    if (rows.length === 0) return;
    const header = [
      'Receipt #',
      'Student',
      'Student ID',
      'Payment Type',
      'Amount',
      'Date',
      'Status',
      'Transaction ID',
      'Payment Method',
    ];
    const lines = rows.map((r) => [
      r.receiptNo,
      r.studentName,
      r.studentId,
      r.paymentType,
      r.amount,
      r.date,
      r.status,
      r.transactionId || '',
      r.paymentMethod || '',
    ]);
    const csv = [header, ...lines]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Pill-style status badges matching the design mock:
   *   - Paid     → light-green background, green text, green dot
   *   - Refunded → light-orange background, orange text, orange dot
   *   - Pending  → light-gray background, gray text, gray dot
   *
   * Returns both the pill classes and the dot color in one shot so the cell
   * stays declarative.
   */
  const getStatusStyles = (status: Receipt['status']) => {
    switch (status) {
      case 'Paid':
        return {
          pill: 'bg-green-50 text-green-700',
          dot: 'bg-green-500',
        };
      case 'Refunded':
        return {
          pill: 'bg-orange-50 text-orange-700',
          dot: 'bg-orange-500',
        };
      case 'Pending':
        return {
          pill: 'bg-gray-100 text-gray-600',
          dot: 'bg-gray-400',
        };
      default:
        return {
          pill: 'bg-gray-100 text-gray-600',
          dot: 'bg-gray-400',
        };
    }
  };

  // Per-receipt detail view (delegates download to DownloadReceipt).
  if (selectedReceipt) {
    return (
      <ReceiptDetail
        receipt={selectedReceipt}
        onBack={() => setSelectedReceipt(null)}
      />
    );
  }

  return (
    <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-4 md:mb-6'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Receipts
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Manage your exam questions effectively
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={loading || rows.length === 0}
          className='px-3 sm:px-4 py-2.5 bg-primary-green text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-green-hover transition-colors flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Download className='w-4 h-4' />
          <span className='hidden sm:inline'>Download report</span>
          <span className='sm:hidden'>Download</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 md:mb-6'>
        <div className='flex-1 relative'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search by name, email or ID...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-h-[44px]'
          />
        </div>

        <div className='flex gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white whitespace-nowrap min-h-[44px]'>
                <ListFilter className='w-4 h-4' />
                <span className='hidden sm:inline'>Filter by status</span>
                <span className='sm:hidden'>Status</span>
                {statusFilter !== 'all' && (
                  <span className='ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs'>
                    {statusFilter}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                <span className='cursor-pointer'>All</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Paid')}>
                <span className='cursor-pointer'>Paid</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Refunded')}>
                <span className='cursor-pointer'>Refunded</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Pending')}>
                <span className='cursor-pointer'>Pending</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className='flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white whitespace-nowrap min-h-[44px]'>
            <ListFilter className='w-4 h-4' />
            <span className='hidden sm:inline'>Filter by grade</span>
            <span className='sm:hidden'>Grade</span>
          </button>
        </div>
      </div>

      {/* Payment History Table */}
      <div className='bg-white rounded-xl border border-gray-100'>
        <div className='p-4'>
          <h2 className='text-sm sm:text-base font-semibold text-gray-900'>
            Payment History
          </h2>
        </div>

        {/* Inner rounded wrapper — gives the table its own subtle border and
            tinted header strip, matching the design mock. */}
        <div className='overflow-x-auto p-4 pt-0'>
          <div className='rounded-xl overflow-hidden border border-gray-100'>
            <table className='w-full min-w-[700px] border-collapse'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Receipt
                </th>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Student
                </th>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Payment Type
                </th>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Amount
                </th>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Date
                </th>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Status
                </th>
                <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {errored ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-3 sm:px-6 py-12 text-center text-sm text-gray-500'
                  >
                    Couldn&apos;t load receipts.{' '}
                    <button
                      onClick={fetch}
                      className='text-green-700 hover:text-green-900 font-medium'
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-3 sm:px-6 py-12 text-center text-sm text-gray-500'
                  >
                    Loading receipts…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-3 sm:px-6 py-12 text-center text-sm text-gray-500'
                  >
                    No receipts found
                  </td>
                </tr>
              ) : (
                rows.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900'>
                      {receipt.receiptNo}
                    </td>
                    <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600'>
                      {receipt.studentName}
                    </td>
                    <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600'>
                      {receipt.paymentType}
                    </td>
                    <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900'>
                      {receipt.amount}
                    </td>
                    <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600'>
                      {receipt.date}
                    </td>
                    <td className='px-3 sm:px-6 py-3 sm:py-4'>
                      {(() => {
                        const styles = getStatusStyles(receipt.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.pill}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}
                            />
                            {receipt.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className='px-3 sm:px-6 py-3 sm:py-4'>
                      <button
                        onClick={() => setSelectedReceipt(receipt)}
                        className='text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center'
                      >
                        <Eye className='w-5 h-5' />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination — lives in the outer card, below the inner table wrapper. */}
        {rows.length > 0 && totalPages > 1 && (
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100'>
            <div className='flex items-center justify-between w-full sm:w-auto gap-2'>
              <button
                className='flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className='w-4 h-4' />
                <span className='hidden sm:inline'>Previous</span>
                <span className='sm:hidden'>Prev</span>
              </button>

              <span className='text-xs sm:hidden text-gray-500'>
                {currentPage} / {totalPages}
              </span>

              <button
                className='flex sm:hidden items-center gap-1 px-3 py-2.5 text-xs text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>

            <div className='hidden sm:flex items-center gap-2'>
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === 'number' && handlePageChange(page)
                  }
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
              className='hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipts;
