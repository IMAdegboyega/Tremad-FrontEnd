'use client'

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onDelete?: () => void;
}

const DeleteFileModal: React.FC<DeleteFileModalProps> = ({ 
  isOpen, 
  onClose, 
  fileName,
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Simulate API call - replace with actual delete logic
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onDelete) {
      onDelete();
    }
    
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Delete File
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete <span className="font-medium text-gray-700">"{fileName}"</span>? This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFileModal;