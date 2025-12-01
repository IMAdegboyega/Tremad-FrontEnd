import React, { useState } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'excel' | 'pdf' | 'doc' | 'other';
}

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: UploadedFile[]) => void;
}

const AddFileModal: React.FC<AddFileModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Date.now() + Math.random().toString(),
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string): 'excel' | 'pdf' | 'doc' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'xlsx' || extension === 'xls') return 'excel';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'doc' || extension === 'docx') return 'doc';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    const iconClass = "w-8 h-10";
    
    switch (type) {
      case 'excel':
        return (
          <div className={`${iconClass} bg-green-100 rounded flex items-center justify-center`}>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
        );
      case 'pdf':
        return (
          <div className={`${iconClass} bg-red-100 rounded flex items-center justify-center`}>
            <FileText className="w-5 h-5 text-red-600" />
          </div>
        );
      default:
        return (
          <div className={`${iconClass} bg-gray-100 rounded flex items-center justify-center`}>
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
        );
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUpload = () => {
    onUpload(uploadedFiles);
    setUploadedFiles([]);
    onClose();
  };

  const handleClose = () => {
    setUploadedFiles([]);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
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

        {/* Content */}
        <div className="px-6 pb-6">
          {uploadedFiles.length === 0 ? (
            // Empty State - Drop Zone
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                accept=".doc,.docx,.pdf,.xls,.xlsx,.csv"
                className="hidden"
              />
              
              <label 
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Drop your file here
                </p>
                <p className="text-sm text-gray-500">
                  or <span className="text-blue-600 hover:underline">Browse</span> to upload file
                </p>
              </label>
            </div>
          ) : (
            // Files Uploaded State
            <div>
              {/* Drop Zone - Smaller */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
                  isDragging 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload-2"
                  multiple
                  onChange={handleFileSelect}
                  accept=".doc,.docx,.pdf,.xls,.xlsx,.csv"
                  className="hidden"
                />
                
                <label 
                  htmlFor="file-upload-2"
                  className="cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop your file here
                  </p>
                  <p className="text-xs text-gray-500">
                    or <span className="text-blue-600 hover:underline">Browse</span> to upload file
                  </p>
                </label>
              </div>

              {/* Uploaded Files List */}
              <div>
                <p className="text-sm text-gray-700 mb-3">Upload list</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* File format note */}
          <p className="text-xs text-gray-500 mt-4">
            Only supports doc, pdf and csv files.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 pt-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              uploadedFiles.length > 0
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {uploadedFiles.length === 0 ? 'Upload' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;