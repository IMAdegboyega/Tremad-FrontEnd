'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatAmount,
  formatStatusLabel,
  getStatusColor,
  getStatusDot,
} from '@/Constants/Payment';
import type { Payment } from '@/lib/api/student.service';
import { Download, FileText } from 'lucide-react';

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
}

type Tab = 'school-fees' | 'supplementary' | 'history';

/**
 * Render a friendly date from a possibly-missing backend date string.
 */
const fmtDate = (d?: string): string => {
  if (!d) return '—';
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-GB');
};

/**
 * PaymentTable
 *
 * Tabbed view of student payments: outstanding school fees, supplementary
 * (non-tuition) fees, and a full payment history. The backend returns a
 * single Payment[] array — we partition it here by status/type for display.
 */
const PaymentTable: React.FC<PaymentTableProps> = ({ payments, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('school-fees');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /**
   * Partition payments into the three tab buckets. Any type that isn't a
   * tuition/school fee gets filed under "supplementary".
   */
  const { schoolFees, supplementaryFees, history } = useMemo(() => {
    const outstanding = payments.filter((p) => p.status !== 'paid');
    const schoolFeeKeywords = ['school', 'tuition', 'term'];

    const isSchoolFee = (p: Payment) => {
      const t = (p.type || '').toLowerCase();
      return schoolFeeKeywords.some((k) => t.includes(k));
    };

    return {
      schoolFees: outstanding.filter(isSchoolFee),
      supplementaryFees: outstanding.filter((p) => !isSchoolFee(p)),
      history: [...payments].sort((a, b) => {
        const da = a.paidDate || a.dueDate || '';
        const db = b.paidDate || b.dueDate || '';
        return db.localeCompare(da);
      }),
    };
  }, [payments]);

  const currentData: Payment[] =
    activeTab === 'school-fees'
      ? schoolFees
      : activeTab === 'supplementary'
      ? supplementaryFees
      : history;

  const hasData = currentData.length > 0;

  const renderTabs = () => (
    <div className='bg-white rounded-lg border border-gray-100'>
      <div className='flex gap-2 sm:gap-8 p-1'>
        {(
          [
            ['school-fees', 'School fees'],
            ['supplementary', 'Supplementary fees'],
            ['history', 'History'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`py-2 text-xs sm:text-sm font-medium px-3 sm:p-4 rounded-lg transition-colors flex-1 sm:flex-initial ${
              activeTab === value
                ? 'text-green-900 bg-green-100'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {renderTabs()}
        <div className='bg-white rounded-lg border border-gray-100 p-6 space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 flex-1' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-8 w-24' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderEmpty = (label: string) => (
    <div className='py-16'>
      <div className='flex flex-col items-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <FileText className='w-8 h-8 text-gray-400' />
        </div>
        <p className='text-gray-900 font-medium mb-1'>{label}</p>
        <p className='text-sm text-gray-500'>Your fees will appear here</p>
      </div>
    </div>
  );

  const emptyLabel =
    activeTab === 'history'
      ? 'No payment history yet'
      : activeTab === 'school-fees'
      ? 'No outstanding school fees'
      : 'No outstanding supplementary fees';

  return (
    <div>
      <div className='space-y-4'>
        {renderTabs()}

        {/* Desktop Table */}
        <div className='overflow-x-auto rounded-lg bg-white border border-gray-100 hidden sm:block'>
          {!hasData ? (
            renderEmpty(emptyLabel)
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-white rounded-lg border-b border-gray-200'>
                  <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                    Title
                  </th>
                  {activeTab === 'history' ? (
                    <>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                        Amount
                      </th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                        Payment date
                      </th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                        Status
                      </th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                        Reference
                      </th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                        Action
                      </th>
                    </>
                  ) : (
                    <>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>
                        Due date
                      </th>
                      <th className='text-right py-3 px-6 text-sm font-normal text-gray-600'>
                        Amount
                      </th>
                      <th className='text-center py-3 px-6 text-sm font-normal text-gray-600'>
                        Action
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'history'
                  ? history.map((item) => (
                      <tr key={item._id} className='hover:bg-gray-50'>
                        <td className='py-4 px-6 text-sm text-gray-900'>
                          {item.type || '—'}
                        </td>
                        <td className='py-4 px-6 text-sm text-gray-900 font-medium'>
                          {formatAmount(item.amount)}
                        </td>
                        <td className='py-4 px-6 text-sm text-gray-600'>
                          {fmtDate(item.paidDate || item.dueDate)}
                        </td>
                        <td className='py-4 px-6'>
                          <div className='flex items-center gap-2'>
                            <span
                              className={`w-2 h-2 rounded-full ${getStatusDot(
                                item.status
                              )}`}
                            />
                            <span
                              className={`text-sm ${getStatusColor(item.status)}`}
                            >
                              {formatStatusLabel(item.status)}
                            </span>
                          </div>
                        </td>
                        <td className='py-4 px-6 text-sm text-gray-600'>
                          {item.reference || '—'}
                        </td>
                        <td className='py-4 px-6'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-green-700 hover:text-green-800'
                            disabled={item.status !== 'paid'}
                          >
                            <Download size={14} className='mr-2' />
                            <span className='text-xs'>Download receipt</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  : (activeTab === 'school-fees'
                      ? schoolFees
                      : supplementaryFees
                    ).map((fee) => (
                      <tr key={fee._id} className='hover:bg-gray-50'>
                        <td className='py-4 px-6 text-sm text-gray-900'>
                          {fee.type || '—'}
                        </td>
                        <td className='py-4 px-6 text-sm text-gray-600'>
                          {fmtDate(fee.dueDate)}
                        </td>
                        <td className='py-4 px-6 text-right text-sm font-medium text-gray-900'>
                          {formatAmount(fee.amount)}
                        </td>
                        <td className='py-4 px-6 text-center'>
                          <Button
                            size='sm'
                            className='bg-primary-green hover:bg-primary-green-hover text-white px-6'
                            onClick={() => setShowSuccessModal(true)}
                          >
                            Pay now →
                          </Button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className='sm:hidden space-y-3'>
          {!hasData ? (
            <div className='bg-white rounded-lg border border-gray-100'>
              {renderEmpty(emptyLabel)}
            </div>
          ) : (
            <>
              {(activeTab === 'school-fees' || activeTab === 'supplementary') &&
                (activeTab === 'school-fees'
                  ? schoolFees
                  : supplementaryFees
                ).map((fee) => (
                  <div
                    key={fee._id}
                    className='bg-white rounded-xl p-5 space-y-4'
                  >
                    <h3 className='text-base font-semibold text-gray-900'>
                      {fee.type || '—'}
                    </h3>
                    <p className='text-sm text-gray-600 leading-relaxed'>
                      Due {fmtDate(fee.dueDate)}
                    </p>
                    <div className='flex items-center justify-between pt-2'>
                      <span className='text-lg font-bold text-gray-900'>
                        {formatAmount(fee.amount)}
                      </span>
                      <Button
                        size='sm'
                        className='bg-primary-green hover:bg-primary-green-hover text-white px-5 py-2.5 h-auto rounded-lg font-medium'
                        onClick={() => setShowSuccessModal(true)}
                      >
                        Pay now →
                      </Button>
                    </div>
                  </div>
                ))}

              {activeTab === 'history' &&
                history.map((item) => (
                  <div
                    key={item._id}
                    className='bg-white rounded-xl p-5 space-y-4'
                  >
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Title:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {item.type || '—'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Date:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {fmtDate(item.paidDate || item.dueDate)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Status:</span>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusDot(
                              item.status
                            )}`}
                          />
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {formatStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Amount:</span>
                        <span className='text-sm font-bold text-gray-900'>
                          {formatAmount(item.amount)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Reference:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {item.reference || '—'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 h-auto py-3 rounded-lg font-medium flex items-center justify-center gap-2'
                      disabled={item.status !== 'paid'}
                    >
                      <Download size={16} />
                      Download receipt
                    </Button>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center space-y-4'>
            <h3 className='text-lg font-semibold'>Payment processing</h3>
            <p className='text-sm text-gray-600'>
              Online payments are not available yet. Please contact the bursary
              to settle this fee.
            </p>
            <Button
              className='w-full bg-primary-green hover:bg-primary-green-hover text-white'
              onClick={() => setShowSuccessModal(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
