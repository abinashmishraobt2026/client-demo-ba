import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { uploadAPI } from '../../services/api';

const FileUpload = ({ 
  onUploadSuccess, 
  onUploadError,
  uploadType = 'general', // 'commissionScreenshot', 'packageImage', 'associateDocument', 'general'
  accept = 'image/*',
  maxSize = 5, // MB
  multiple = false,
  className = '',
  id,
  name,
  children
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Validate file size
    for (let file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        
        const response = await uploadAPI.multiple(formData);
        
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data.files);
        }
        
        toast.success(`${files.length} files uploaded successfully!`);
      } else {
        const file = files[0];
        
        // Determine the field name based on upload type
        let fieldName = 'file';
        switch (uploadType) {
          case 'commissionScreenshot':
            fieldName = 'screenshot';
            break;
          case 'packageImage':
            fieldName = 'image';
            break;
          case 'associateDocument':
            fieldName = 'document';
            break;
          default:
            fieldName = 'file';
        }
        
        formData.append(fieldName, file);
        
        // Call appropriate upload API
        let response;
        switch (uploadType) {
          case 'commissionScreenshot':
            response = await uploadAPI.commissionScreenshot(formData);
            break;
          case 'packageImage':
            response = await uploadAPI.packageImage(formData);
            break;
          case 'associateDocument':
            response = await uploadAPI.associateDocument(formData);
            break;
          default:
            response = await uploadAPI.multiple(formData);
        }
        
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }
        
        toast.success('File uploaded successfully!');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (accept.includes('image')) {
      return <PhotoIcon className="h-8 w-8 text-gray-400" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-400" />;
  };

  if (children) {
    return (
      <div className={className}>
        <input
          id={id || 'file-upload'}
          name={name || 'file'}
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div onClick={openFileDialog} className="cursor-pointer">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        id={id || 'file-upload-drop'}
        name={name || 'file'}
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? openFileDialog : undefined}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {accept.includes('image') ? 'Images' : 'Files'} up to {maxSize}MB
            </p>
            {multiple && (
              <p className="text-xs text-gray-500">
                You can upload multiple files at once
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// File preview component
export const FilePreview = ({ file, onRemove, className = '' }) => {
  const isImage = file.url && (file.url.includes('.jpg') || file.url.includes('.jpeg') || file.url.includes('.png'));
  
  return (
    <div className={`relative group ${className}`}>
      {isImage ? (
        <div className="relative">
          <img 
            src={file.url} 
            alt={file.originalName || 'Uploaded file'}
            className="w-full h-32 object-cover rounded-lg border"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(file)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center p-3 border rounded-lg bg-gray-50">
          <DocumentIcon className="h-8 w-8 text-gray-400 mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.originalName || 'Unknown file'}
            </p>
            <p className="text-xs text-gray-500">
              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
            </p>
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(file)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;