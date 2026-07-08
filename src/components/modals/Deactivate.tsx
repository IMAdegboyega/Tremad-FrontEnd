'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { deactivateUser } from '@/lib/api/superAdmin.service';

interface DeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  /** Optional callback after the deactivation succeeds (e.g. refetch list). */
  onDeactivated?: () => void;
}

/**
 * Deactivate modal — calls PUT /super-admin/users/:userId/deactivate.
 *
 * Reversible: flips `isActive = false` and ends active sessions, but
 * leaves the email + admission number alone so the same student can be
 * reactivated later (e.g. after a term-long suspension). Distinct from the
 * Delete modal, which goes through `removeUser` and is permanent.
 */
const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onDeactivated,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset transient state every time the modal opens so the previous open's
  // success/error doesn't leak into the next confirmation.
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeactivate = async () => {
    if (!studentId) {
      setError('Missing student ID — refresh and try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await deactivateUser(studentId);
      if (res?.success) {
        setShowSuccess(true);
        onDeactivated?.();
      } else {
        setError(res?.message || 'Could not deactivate. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setError('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      showSuccess ? handleDone() : onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
    >
      {!showSuccess ? (
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
          <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4'>
            <AlertCircle className='w-6 h-6 text-red-600' />
          </div>

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Deactivate account
          </h2>
          <p className='text-sm text-gray-600 mb-2'>
            Are you sure you want to deactivate{' '}
            <span className='font-semibold'>{studentName}&apos;s</span> account?
          </p>
          <p className='text-xs text-gray-500 mb-6'>
            They will be unable to log in until reactivated. Historical records
            and audit logs are preserved.
          </p>

          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <div className='flex gap-3 justify-end'>
            <button
              onClick={onClose}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50'
            >
              No, Cancel
            </button>
            <button
              onClick={handleDeactivate}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 disabled:opacity-50'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? 'Deactivating…' : 'Yes, Deactivate'}
            </button>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
          <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
            <CheckCircle className='w-6 h-6 text-green-600' />
          </div>

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Success!</h2>
          <p className='text-sm text-gray-600 mb-6'>
            {studentName}&apos;s account has been deactivated. They cannot log
            in until reactivated.
          </p>

          <div className='flex justify-end'>
            <button
              onClick={handleDone}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg'
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeactivateAccountModal;
