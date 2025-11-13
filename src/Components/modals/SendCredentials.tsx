import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SendCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

type EmailTemplate = 'welcome' | 'reminder' | 'custom';

const SendCredentialsModal: React.FC<SendCredentialsModalProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendResetLink, setSendResetLink] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>('welcome');

  if (!isOpen) return null;

  const handleSend = () => {
    // Simulate API call
    setShowSuccess(true);
  };

  const handleDone = () => {
    setShowSuccess(false);
    setSendResetLink(false);
    setEmailTemplate('welcome');
    onClose();
  };

  const handleCancel = () => {
    setSendResetLink(false);
    setEmailTemplate('welcome');
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
        // Send Credentials Form
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Send Login Credentials
              </h2>
              <p className="text-sm text-gray-600 mt-1">{studentName}</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Send your login credentials an account.
          </p>

          {/* Credentials Options */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Send credentials to:
            </label>

            <div className="space-y-3">
              {/* Generate Temporary Password */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-500 opacity-50 cursor-not-allowed"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Generate temporary password (recommended)
                  </span>
                </div>
              </label>

              {/* Send Reset Link */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendResetLink}
                  onChange={(e) => setSendResetLink(e.target.checked)}
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

          {/* Email Template Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Email Template:
            </label>

            <div className="space-y-3">
              {/* Welcome Email */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="emailTemplate"
                  value="welcome"
                  checked={emailTemplate === 'welcome'}
                  onChange={(e) => setEmailTemplate(e.target.value as EmailTemplate)}
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Welcome Email (for new accounts)
                  </span>
                </div>
              </label>

              {/* Login Reminder */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="emailTemplate"
                  value="reminder"
                  checked={emailTemplate === 'reminder'}
                  onChange={(e) => setEmailTemplate(e.target.value as EmailTemplate)}
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Login Reminder (for existing accounts)
                  </span>
                </div>
              </label>

              {/* Custom Message */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="emailTemplate"
                  value="custom"
                  checked={emailTemplate === 'custom'}
                  onChange={(e) => setEmailTemplate(e.target.value as EmailTemplate)}
                  className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Custom Message
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
              onClick={handleSend}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Send details
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
            Login credentials sent to <span className="font-semibold">{studentName}</span>
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

export default SendCredentialsModal;