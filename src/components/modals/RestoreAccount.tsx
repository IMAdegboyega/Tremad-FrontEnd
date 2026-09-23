'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, CheckCircle, Copy, Check } from 'lucide-react';
import { restoreUser } from '@/lib/api/superAdmin.service';
import { DeletionState, purgeDetail } from '@/Constants/retention';

interface RestoreAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  /** Noun used in the copy — "student" (default) or e.g. "staff member". */
  subjectNoun?: string;
  /** The row's deletion block, so the dialog can show how long is left. */
  deletion?: DeletionState | null;
  onRestored?: () => void;
}

/**
 * Restore a deleted account, inside its window.
 *
 * The success panel is the important half of this component, not the
 * confirmation. Restoring always mints a NEW temporary password, and this is
 * the only moment it is ever shown in full — so the dialog holds it, offers a
 * copy button, and does not close itself. An admin who dismisses this by
 * reflex can still recover it through Reset password, but making them do that
 * for a password we just generated would be our fault, not theirs.
 *
 * Sibling to DeleteAccountModal and deliberately shaped like it, down to the
 * state reset on open — without that, a previous restore's success panel
 * appears the instant this reopens for a different person, showing THEIR
 * password under someone else's name.
 */
const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  subjectNoun = 'student',
  deletion,
  onRestored,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError('');
      setTempPassword('');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async () => {
    if (!userId) {
      setError(`Missing ${subjectNoun} ID — refresh and try again.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await restoreUser(userId);
      if (res?.success && res.data?.tempPassword) {
        setTempPassword(res.data.tempPassword);
        onRestored?.();
      } else if (res?.success) {
        // Restored, but the password didn't come back. Say so rather than
        // showing an empty box — the admin needs to know to go and reset.
        setTempPassword('');
        setError(
          'Account restored, but the temporary password was not returned. Use Reset password to issue one.'
        );
        onRestored?.();
      } else {
        setError(res?.message || 'Could not restore. Please try again.');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some contexts. The password is on screen and
      // selectable, so this is a convenience failing, not the feature failing.
    }
  };

  const done = () => {
    setTempPassword('');
    setError('');
    onClose();
  };

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      tempPassword ? done() : onClose();
    }
  };

  return (
    <div
      onClick={onBackdrop}
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
    >
      {!tempPassword ? (
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
          <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
            <RotateCcw className='w-6 h-6 text-primary-green' />
          </div>

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Restore account
          </h2>
          <p className='text-sm text-gray-600 mb-2'>
            Bring <span className='font-semibold'>{userName}&apos;s</span>{' '}
            account back?
          </p>

          {deletion?.isDeleted && (
            <p className='text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3'>
              {purgeDetail(deletion)}
            </p>
          )}

          <div className='text-xs text-gray-500 mb-6 space-y-2'>
            <p>
              They&apos;ll be able to sign in again immediately with a{' '}
              <span className='font-semibold text-gray-700'>
                new temporary password
              </span>
              , which you&apos;ll see on the next screen and which is also
              emailed to them. Their old password will not work.
            </p>
            {subjectNoun !== 'student' && (
              <p>
                If they were a class teacher, that role is{' '}
                <span className='font-semibold text-gray-700'>not</span> given
                back automatically — someone else may hold it now. Reassign it
                from their profile if needed.
              </p>
            )}
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
              onClick={handleRestore}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-white bg-primary-green hover:bg-primary-green-hover rounded-lg flex items-center gap-2 disabled:opacity-50'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? 'Restoring…' : 'Yes, Restore'}
            </button>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
          <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
            <CheckCircle className='w-6 h-6 text-green-600' />
          </div>

          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Restored</h2>
          <p className='text-sm text-gray-600 mb-4'>
            {userName}&apos;s account is active again. Give them this temporary
            password — they&apos;ll be asked to change it on sign-in.
          </p>

          <div className='flex items-center gap-2 mb-2'>
            <code className='flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono break-all select-all'>
              {tempPassword}
            </code>
            <button
              onClick={copy}
              title='Copy'
              className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className='text-xs text-gray-400 mb-6'>
            Also sent to their email. You can view it again later under Reveal
            temporary password, until they set their own.
          </p>

          <div className='flex justify-end'>
            <button
              onClick={done}
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

export default RestoreAccountModal;
