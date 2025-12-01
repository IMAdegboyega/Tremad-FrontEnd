import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentEmail: string;
}

type ResetMethod = 'temporary' | 'custom' | 'email';

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentEmail,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [resetMethod, setResetMethod] = useState<ResetMethod>('temporary');

  if (!isOpen) return null;

  const handleReset = () => {
    // Simulate API call
    setShowSuccess(true);
  };

  const handleDone = () => {
    setShowSuccess(false);
    setResetMethod('temporary');
    onClose();
  };

  const handleCancel = () => {
    setResetMethod('temporary');
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      if (showSuccess) {
        handleDone();
      } else {
        onClose();
      }
    }
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {!showSuccess ? (
        // Reset Password Form
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Reset password
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Please select the preferred option for
          </p>

          {/* Reset Method Options */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Choose reset method:
            </label>

            <div className="space-y-3">
              {/* Generate Temporary Password */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="resetMethod"
                  value="temporary"
                  checked={resetMethod === 'temporary'}
                  onChange={(e) => setResetMethod(e.target.value as ResetMethod)}
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-800"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Generate temporary password (recommended)
                  </span>
                </div>
              </label>

              {/* Set Custom Password */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="resetMethod"
                  value="custom"
                  checked={resetMethod === 'custom'}
                  onChange={(e) => setResetMethod(e.target.value as ResetMethod)}
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Set custom password
                  </span>
                </div>
              </label>

              {/* Send Reset Link */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="resetMethod"
                  value="email"
                  checked={resetMethod === 'email'}
                  onChange={(e) => setResetMethod(e.target.value as ResetMethod)}
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Send reset link to email
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Reset Password
            </button>
          </div>
        </div>
      ) : (
        // Success Dialog
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Success Icon */}
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>

          {/* Content */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Success!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Password reset successful. New temporary password sent to {studentEmail}
          </p>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={handleDone}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
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