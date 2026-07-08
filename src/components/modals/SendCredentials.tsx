'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Mail } from 'lucide-react';
import { resetUserPassword } from '@/lib/api/superAdmin.service';

interface SendCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentEmail?: string;
}

/**
 * Send credentials modal — under the hood this calls
 * PUT /super-admin/reset-password/:userId. The reset controller already:
 *   1. Generates a fresh temp password
 *   2. Saves the hash to the DB
 *   3. Emails the plaintext to the student via emailService.sendPasswordReset
 *   4. Terminates the user's active sessions
 *
 * So "Send credentials" and "Reset password" share the same backend action;
 * we just frame the UI around the email delivery here rather than the
 * copy-from-screen flow.
 */
const SendCredentialsModal: React.FC<SendCredentialsModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentEmail,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset transient state on each open so the previous send's success doesn't
  // pre-fill the next confirmation.
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!studentId) {
      setError('Missing student ID — refresh and try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await resetUserPassword(studentId);
      if (res?.success) {
        setShowSuccess(true);
      } else {
        setError(res?.message || 'Could not send credentials.');
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
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Send login credentials
              </h2>
              <p className='text-sm text-gray-600 mt-1'>{studentName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className='text-gray-400 hover:text-gray-600 disabled:opacity-50'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start gap-2'>
            <Mail className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-sm text-blue-900'>
                A fresh temporary password will be generated and emailed to{' '}
                <span className='font-semibold'>
                  {studentEmail || 'the student'}
                </span>
                .
              </p>
              <p className='text-xs text-blue-700 mt-1'>
                Their existing sessions will be ended and they&apos;ll be
                prompted to change the password on next login.
              </p>
            </div>
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
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? 'Sending…' : 'Send credentials'}
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
            New credentials sent to{' '}
            <span className='font-semibold'>
              {studentEmail || studentName}
            </span>
            .
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

export default SendCredentialsModal;
