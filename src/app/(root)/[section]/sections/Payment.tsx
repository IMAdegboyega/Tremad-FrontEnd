'use client';

import React, { useEffect, useState } from 'react';
import { Download, Check, FileText, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PaymentTable from '@/components/student/Payment/PaymentTable';
import StatsCard from '@/components/student/Payment/StatsCard';
import { getPaymentHistory, type Payment } from '@/lib/api/student.service';
import { termOptions } from '@/Constants/Payment';

/**
 * Lightweight dropdown for selecting term/filters in Payment.
 */
const SelectDropdown = ({
  options,
  value,
  onChange,
  icon,
  placeholder,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='flex items-center shadow-none gap-0 px-3 lg:px-5 py-3 lg:py-5 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 w-full lg:w-auto'
        >
          <span className='text-gray-500'>{icon}</span>
          <span className='px-2 lg:px-3 py-2 text-sm text-gray-700 font-normal'>
            {selectedOption?.label || placeholder}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-full min-w-[180px]'>
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className='flex items-center justify-between cursor-pointer'
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className='w-4 h-4 text-green-600' />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Payment = () => {
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPaymentHistory()
      .then((res) => {
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setPayments(res.data);
        } else {
          setPayments([]);
        }
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply the term filter on the client. "current" means no filter.
  const filteredPayments =
    selectedTerm === 'current'
      ? payments
      : payments.filter((p) => {
          const t = (p.term || '').toLowerCase();
          return (
            t === selectedTerm.toLowerCase() ||
            t.startsWith(selectedTerm.toLowerCase())
          );
        });

  return (
    <div className='space-y-4 lg:space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Payment</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Easily manage and track your payments and fees
          </p>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4'>
          <SelectDropdown
            options={termOptions}
            value={selectedTerm}
            onChange={setSelectedTerm}
            icon={<ListFilter size={16} />}
            placeholder='Select term'
          />

          <Button
            className='flex bg-primary-green hover:bg-primary-green-hover px-5 py-5 text-white items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={() => setShowDownloadModal(true)}
            disabled={loading || filteredPayments.length === 0}
          >
            <Download size={18} className='mr-2' />
            Download receipt
          </Button>
        </div>
      </div>

      <StatsCard payments={filteredPayments} isLoading={loading} />

      <PaymentTable payments={filteredPayments} isLoading={loading} />

      {showDownloadModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full mx-4'>
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center'>
                <FileText className='w-8 h-8 text-yellow-600' />
              </div>
            </div>
            <h3 className='text-lg font-semibold text-center mb-2'>
              Download receipt
            </h3>
            <p className='text-sm text-gray-600 text-center mb-6'>
              You are about to download your payment receipt for the selected
              term.
            </p>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => setShowDownloadModal(false)}
              >
                No, Cancel
              </Button>
              <Button
                className='flex-1 bg-primary-green hover:bg-primary-green-hover text-white'
                onClick={() => {
                  setShowDownloadModal(false);
                  setShowSuccessModal(true);
                }}
              >
                Yes, download
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full mx-4'>
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <Check className='w-8 h-8 text-green-600' />
              </div>
            </div>
            <h3 className='text-lg font-semibold text-center mb-2'>Success!</h3>
            <p className='text-sm text-gray-600 text-center mb-6'>
              You have successfully downloaded your receipt
            </p>
            <Button
              className='w-full bg-primary-green hover:bg-primary-green-hover text-white'
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
