'use client'

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename?: (newName: string) => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ 
  isOpen, 
  onClose, 
  currentName,
  onRename 
}) => {
  const [newName, setNewName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update input when currentName changes (modal opens with different file)
  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleRename = async () => {
    if (!newName.trim() || newName === currentName) return;
    
    setIsSubmitting(true);
    
    // Simulate API call - replace with actual rename logic
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onRename) {
      onRename(newName.trim());
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setNewName(currentName);
    onClose();
  };

  if (!isOpen) return null;

  const hasChanges = newName.trim() !== currentName && newName.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Rename
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Rename your documents here
          </p>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Label
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter new name"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleRename}
              disabled={!hasChanges || isSubmitting}
              className={`
                px-6 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${hasChanges && !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? 'Saving...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;