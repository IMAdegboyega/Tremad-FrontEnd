'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { removeUser } from '@/lib/api/superAdmin.service';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  onDeleted?: () => void;
}

/**
 * Delete modal — currently routes through `removeUser`, which the backend
 * implements as a soft delete (sets isActive=false, ends sessions). The user
 * record persists so audit logs, payment history, and result records still
 * resolve. We expose this as "Delete" in the UI because that's how admins
 * think about it, but with copy that explains the actual behavior.
 *
 * If a hard-delete endpoint is added later (cascading into payments, results,
 * etc.), swap the call here and update the copy.
 */
const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onDeleted,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset transient state every time the modal opens. Without this, the
  // success/error state from a previous open would carry over into the next
  // open — the user would see "Success!" before the confirmation dialog.
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!studentId) {
      setError('Missing student ID — refresh and try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await removeUser(studentId);
      if (res?.success) {
        setShowSuccess(true);
        onDeleted?.();
      } else {
        setError(res?.message || 'Could not delete. Please try again.');
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
            <Trash2 className='w-6 h-6 text-red-600' />
          </div>

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Delete account
          </h2>
          <p className='text-sm text-gray-600 mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{studentName}&apos;s</span> account?
          </p>
          <p className='text-xs text-gray-500 mb-6'>
            The account will be disabled and the student locked out. Historical
            data (results, payments, audit logs) is preserved.
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
              onClick={handleDelete}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 disabled:opacity-50'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? 'Deleting…' : 'Yes, Delete'}
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
            {studentName}&apos;s account has been removed from the system.
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

export default DeleteAccountModal;
