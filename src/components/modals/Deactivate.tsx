import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface DeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeactivate = () => {
    // Simulate API call
    setShowSuccess(true);
  };

  const handleDone = () => {
    setShowSuccess(false);
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
        // Confirmation Dialog
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>

          {/* Content */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Deactivate account
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to deactivate <span className="font-semibold">{studentName}'s</span> account
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              No, Cancel
            </button>
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Yes, Deactivate
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
            {studentName}'s account has been deactivated. Student cannot login until reactivated
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

export default DeactivateAccountModal;