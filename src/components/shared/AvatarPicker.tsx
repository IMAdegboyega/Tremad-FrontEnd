'use client';

/**
 * Profile-photo picker for the Add Student / Add Staff forms.
 *
 * Deliberately does NOT upload on selection. The file is keyed by user id on
 * Cloudinary, so there's nothing to key it to until the account exists — the
 * parent form holds the File and uploads it after creation returns an id.
 *
 * Validation happens here rather than after submit so a 6 MB photo is caught
 * while the admin is still looking at the form, not after the account has
 * already been created.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, User } from 'lucide-react';

/** Matches the server-side multer cap in config/cloudinary.js. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Shown instead of the placeholder when editing someone who already has one. */
  existingUrl?: string | null;
  /** Rendered as a spinner overlay while the parent is uploading. */
  uploading?: boolean;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

const AvatarPicker: React.FC<Props> = ({
  file,
  onChange,
  existingUrl,
  uploading = false,
  label = 'Profile photo',
  hint = 'Optional. JPG, PNG, WEBP or GIF, up to 5MB.',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Object URLs leak if they're not revoked — recreate on every file change and
  // clean up the previous one.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (selected: File | null) => {
    setError('');
    if (!selected) {
      onChange(null);
      return;
    }
    if (!ACCEPTED.includes(selected.type)) {
      setError('That file type isn’t supported. Use a JPG, PNG, WEBP or GIF.');
      return;
    }
    if (selected.size > MAX_AVATAR_BYTES) {
      const mb = (selected.size / 1024 / 1024).toFixed(1);
      setError(`That image is ${mb}MB — the limit is 5MB.`);
      return;
    }
    onChange(selected);
  };

  const clear = () => {
    setError('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const shown = preview || existingUrl || null;

  return (
    <div>
      <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="Selected profile photo" className="w-full h-full object-cover" />
          ) : (
            <User size={26} className="text-gray-300" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Camera size={15} /> {shown ? 'Change photo' : 'Choose photo'}
            </button>

            {file && (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={clear}
                className="flex items-center gap-1.5 text-sm px-2.5 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={15} /> Remove
              </button>
            )}
          </div>

          {file ? (
            <p className="text-xs text-gray-400 truncate max-w-[240px]">
              {file.name} · {(file.size / 1024).toFixed(0)}KB
            </p>
          ) : (
            <p className="text-xs text-gray-400">{hint}</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default AvatarPicker;
