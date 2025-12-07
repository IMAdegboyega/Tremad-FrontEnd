'use client'

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, FileText, Trash2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: 'excel' | 'pdf' | 'csv' | 'doc';
}

interface CreateNewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (files: File[]) => void;
}

const CreateNewFolderModal: React.FC<CreateNewFolderModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (file: File): 'excel' | 'pdf' | 'csv' | 'doc' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'xlsx' || extension === 'xls') return 'excel';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'csv') return 'csv';
    return 'doc';
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['doc', 'docx', 'pdf', 'csv', 'xls', 'xlsx'];
    
    return validTypes.includes(file.type) || validExtensions.includes(extension || '');
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      if (isValidFileType(file)) {
        newFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: getFileType(file)
        });
      }
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = () => {
    if (uploadedFiles.length > 0 && onUpload) {
      onUpload(uploadedFiles.map(f => f.file));
    }
    handleClose();
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setIsDragging(false);
    onClose();
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'excel':
      case 'csv':
        return (
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
          </div>
        );
      case 'pdf':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  const hasFiles = uploadedFiles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add new file</h2>
              <p className="text-sm text-gray-500 mt-1">Enter details of new file here</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 flex-1 overflow-y-auto">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-400">
                <Upload className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600">
                Drop your file here
              </p>
              <p className="text-sm text-gray-500">
                or{' '}
                <button
                  onClick={handleBrowseClick}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Browse
                </button>
                {' '}to upload file
              </p>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".doc,.docx,.pdf,.csv,.xls,.xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Supported formats hint */}
          <p className="text-xs text-gray-400 mt-3">
            Only supports doc, pdf and csv files.
          </p>

          {/* Upload List */}
          {hasFiles && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload list</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleUpload}
            disabled={!hasFiles}
            className={`
              px-6 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${hasFiles
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {hasFiles ? 'Upload' : 'Button'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewFolderModal;