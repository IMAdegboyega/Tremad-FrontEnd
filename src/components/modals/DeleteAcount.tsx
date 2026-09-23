'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { removeUser } from '@/lib/api/superAdmin.service';
import { RETENTION_DAYS } from '@/Constants/retention';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  /** Noun used in the copy — "student" (default) or e.g. "staff member". */
  subjectNoun?: string;
  onDeleted?: () => void;
}

/**
 * Delete modal.
 *
 * Deleting starts a 365-day clock; it does not destroy anything today. The
 * copy below says so in those words, because the previous version told admins
 * the row "disappears from this list" — which is now false, and was the sort
 * of half-truth that makes people click Delete meaning something else.
 *
 * What an admin needs to know at this moment is exactly three things: they can
 * undo it, roughly how long they have, and that the identifiers stay held in
 * the meantime. Everything else belongs on the record, not in a dialog.
 */
const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  subjectNoun = 'student',
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
      setError(`Missing ${subjectNoun} ID — refresh and try again.`);
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
          <div className='text-xs text-gray-500 mb-6 space-y-2'>
            <p>
              They&apos;ll be signed out and locked out straight away. The
              record stays here, greyed out with a clock beside the name, and
              you can restore it for the next{' '}
              <span className='font-semibold text-gray-700'>
                {RETENTION_DAYS} days
              </span>
              .
            </p>
            <p>
              Their email{subjectNoun === 'student' ? ' and admission number' : ''} stay
              reserved for them the whole time — nobody else can be given
              {subjectNoun === 'student' ? ' them' : ' it'}.
            </p>
            <p className='text-gray-400'>
              After {RETENTION_DAYS} days the record is permanently removed and
              cannot be recovered.
            </p>
          </div>

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

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Deleted</h2>
          <p className='text-sm text-gray-600 mb-2'>
            {studentName}&apos;s account is now inactive.
          </p>
          <p className='text-xs text-gray-500 mb-6'>
            You&apos;ll find it at the bottom of the list with a clock beside
            the name. Restore is available there for {RETENTION_DAYS} days.
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
