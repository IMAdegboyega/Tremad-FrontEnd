'use client';

import React, { useEffect, useState } from 'react';
import { X, Folder } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Returns the created folder's _id on success (so the parent can re-fetch). */
  onCreate: (subject: string, description?: string) => Promise<void> | void;
}

/**
 * Create-folder dialog. Just a name input plus an optional description.
 *
 * Separate from the (misleadingly-named) CreateNewFolderModal, which is
 * actually a file uploader — that one didn't take a folder name and so
 * couldn't actually create a folder. Keep them separate so each modal
 * does exactly one thing.
 */
const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset on every open so a previous attempt's error or partial input
  // doesn't carry over.
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setDescription('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const trimmed = subject.trim();
    if (!trimmed) {
      setError('Folder name is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreate(trimmed, description.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not create folder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50'
        onClick={loading ? undefined : onClose}
      />
      <div className='relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4'>
        <div className='p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0'>
                <Folder className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Create new folder
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Group exam files by subject
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className='text-gray-400 hover:text-gray-600 disabled:opacity-50'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='space-y-4 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Subject *
              </label>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='e.g. Mathematics'
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='What kind of files will live here?'
                rows={3}
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
              />
            </div>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <div className='flex justify-end gap-3'>
            <button
              onClick={onClose}
              disabled={loading}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !subject.trim()}
              className='px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? 'Creating…' : 'Create folder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
