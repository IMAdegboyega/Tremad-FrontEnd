'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Copy, Check } from 'lucide-react';
import { resetUserPassword } from '@/lib/api/superAdmin.service';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Mongo `_id` of the student/admin whose password to reset. */
  studentId: string;
  studentName: string;
  studentEmail: string;
}

/**
 * Reset password modal — wired to PUT /super-admin/reset-password/:userId.
 *
 * The backend generates a fresh temp password, hashes it into the DB, and
 * returns the plaintext once in the response. We surface it here so the admin
 * can copy it; after the modal closes it's gone forever (no second chance).
 */
const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentEmail,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset transient state on each open. Particularly important here: leaving
  // a stale `tempPassword` in memory between opens would mean the next admin
  // sees a previous student's password.
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setError('');
      setLoading(false);
      setTempPassword('');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!studentId) {
      setError('Missing student ID — refresh and try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await resetUserPassword(studentId);
      if (res?.success && res.data?.tempPassword) {
        setTempPassword(res.data.tempPassword);
        setShowSuccess(true);
      } else {
        setError(res?.message || 'Reset failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browser fallback
      const ta = document.createElement('textarea');
      ta.value = tempPassword;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setTempPassword('');
    setError('');
    setCopied(false);
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
            <h2 className='text-xl font-semibold text-gray-900'>
              Reset password
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className='text-gray-400 hover:text-gray-600 disabled:opacity-50'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <p className='text-sm text-gray-600 mb-2'>
            Generate a new temporary password for{' '}
            <span className='font-semibold'>{studentName}</span>.
          </p>
          <p className='text-xs text-gray-500 mb-6'>
            The password will be shown once and the student will be prompted to
            change it on next login.
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
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
          <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
            <CheckCircle className='w-6 h-6 text-green-600' />
          </div>

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Success!</h2>
          <p className='text-sm text-gray-600 mb-4'>
            Temporary password generated for{' '}
            <span className='font-semibold'>{studentName}</span>
            {studentEmail ? <> ({studentEmail})</> : null}.
          </p>

          <div className='bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between gap-3'>
            <div className='min-w-0'>
              <div className='text-xs text-gray-500 uppercase tracking-wide mb-1'>
                Temporary password
              </div>
              <div className='font-mono text-sm font-semibold text-gray-900 break-all'>
                {tempPassword}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className='flex-shrink-0 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg flex items-center gap-1.5'
            >
              {copied ? (
                <>
                  <Check className='w-3.5 h-3.5' />
                  Copied
                </>
              ) : (
                <>
                  <Copy className='w-3.5 h-3.5' />
                  Copy
                </>
              )}
            </button>
          </div>

          <p className='text-xs text-gray-400 mb-6'>
            Share this with the student securely. It will not be shown again.
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

export default ResetPasswordModal;
