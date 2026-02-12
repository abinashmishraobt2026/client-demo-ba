import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { packageImagesAPI } from '../../services/api';
import { formatDate, debounce } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import FileUpload, { FilePreview } from '../../components/common/FileUpload';
import toast from 'react-hot-toast';

const PackageImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [actionType, setActionType] = useState('');
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    link: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      fetchImages();
    }, 500);

    debouncedSearch();
  }, [searchTerm]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await packageImagesAPI.getAll();
      let imageData = response.data.data || [];
      
      // Filter by search term if provided
      if (searchTerm) {
        imageData = imageData.filter(image => 
          image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setImages(imageData);
    } catch {
      toast.error('Failed to load package images');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        imageUrl: uploadedImage?.url || formData.imageUrl
      };
      
      await packageImagesAPI.create(submitData);
      toast.success('Image added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchImages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add image');
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await packageImagesAPI.update(selectedImage.id, formData);
      toast.success('Image updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchImages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update image');
    }
  };

  const handleDeleteImage = async () => {
    try {
      await packageImagesAPI.delete(selectedImage.id);
      toast.success('Image deleted successfully');
      fetchImages();
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!uploadedImage && !formData.imageUrl.trim()) {
      errors.imageUrl = 'Please upload an image or provide an image URL';
    } else if (formData.imageUrl.trim()) {
      // Basic URL validation if URL is provided
      try {
        new URL(formData.imageUrl);
      } catch {
        errors.imageUrl = 'Please enter a valid URL';
      }
    }
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      title: '',
      description: '',
      link: ''
    });
    setFormErrors({});
    setUploadedImage(null);
  };

  const handleEditClick = (image) => {
    setSelectedImage(image);
    setFormData({
      imageUrl: image.imageUrl || '',
      title: image.title || '',
      description: image.description || '',
      link: image.link || ''
    });
    setShowEditModal(true);
  };

  const handlePreviewClick = (image) => {
    setSelectedImage(image);
    setShowPreviewModal(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'delete') {
      handleDeleteImage();
    }
    setShowConfirmModal(false);
    setSelectedImage(null);
    setActionType('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Images</h1>
          <p className="text-gray-600">Manage carousel images for package showcase</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchImages}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Image
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="package-images-search"
            name="packageImagesSearch"
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first package image.'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Image
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => handlePreviewClick(image)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      Added {formatDate(image.createdAt)}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreviewClick(image)}
                          className="text-primary-600 hover:text-primary-900 text-xs"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(image)}
                          className="text-indigo-600 hover:text-indigo-900 text-xs"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedImage(image);
                            setActionType('delete');
                            setShowConfirmModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${image.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Image Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAddModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddImage}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Add New Image
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Package Image</label>
                          
                          {uploadedImage ? (
                            <div className="space-y-3">
                              <FilePreview 
                                file={uploadedImage} 
                                onRemove={() => setUploadedImage(null)}
                                className="max-w-xs"
                              />
                              <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <FileUpload
                                uploadType="packageImage"
                                accept="image/*"
                                maxSize={3}
                                onUploadSuccess={(data) => {
                                  setUploadedImage(data.file);
                                  setFormData({...formData, title: data.packageImage?.title || formData.title});
                                  toast.success('Image uploaded successfully!');
                                }}
                                onUploadError={(error) => {
                                  toast.error('Failed to upload image');
                                }}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
                              />
                              
                              <div className="text-center text-sm text-gray-500">
                                <span>OR</span>
                              </div>
                              
                              <div>
                                <label htmlFor="add-image-url" className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                  id="add-image-url"
                                  name="imageUrl"
                                  type="url"
                                  value={formData.imageUrl}
                                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                                    formErrors.imageUrl ? 'border-red-300' : ''
                                  }`}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                            </div>
                          )}
                          
                          {formErrors.imageUrl && <p className="mt-1 text-sm text-red-600">{formErrors.imageUrl}</p>}
                          <p className="mt-2 text-xs text-gray-500">
                            Upload an image file or provide a direct URL to the image
                          </p>
                        </div>

                        <div>
                          <label htmlFor="add-image-title" className="block text-sm font-medium text-gray-700">Title *</label>
                          <input
                            id="add-image-title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.title ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter image title"
                          />
                          {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
                        </div>

                        <div>
                          <label htmlFor="add-image-description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            id="add-image-description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Enter image description (optional)"
                          />
                        </div>

                        <div>
                          <label htmlFor="add-image-link" className="block text-sm font-medium text-gray-700">Link (optional)</label>
                          <input
                            id="add-image-link"
                            name="link"
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="https://example.com/offer"
                          />
                          <p className="mt-1 text-xs text-gray-500">Associates can open or share this link (e.g. WhatsApp)</p>
                        </div>

                        {/* Image Preview */}
                        {formData.imageUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                            <div className="border border-gray-300 rounded-md p-2">
                              <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {showEditModal && selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowEditModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateImage}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Image
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="edit-image-url" className="block text-sm font-medium text-gray-700">Image URL *</label>
                          <input
                            id="edit-image-url"
                            name="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.imageUrl ? 'border-red-300' : ''
                            }`}
                            placeholder="https://example.com/image.jpg"
                          />
                          {formErrors.imageUrl && <p className="mt-1 text-sm text-red-600">{formErrors.imageUrl}</p>}
                        </div>

                        <div>
                          <label htmlFor="edit-image-title" className="block text-sm font-medium text-gray-700">Title *</label>
                          <input
                            id="edit-image-title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.title ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter image title"
                          />
                          {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
                        </div>

                        <div>
                          <label htmlFor="edit-image-description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            id="edit-image-description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Enter image description (optional)"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-image-link" className="block text-sm font-medium text-gray-700">Link (optional)</label>
                          <input
                            id="edit-image-link"
                            name="link"
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="https://example.com/offer"
                          />
                          <p className="mt-1 text-xs text-gray-500">Associates can open or share this link</p>
                        </div>

                        {/* Image Preview */}
                        {formData.imageUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                            <div className="border border-gray-300 rounded-md p-2">
                              <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
              onClick={() => setShowPreviewModal(false)}
            ></div>

            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white">
                <div className="relative">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.title}
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                    }}
                  />
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="px-6 py-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedImage.title}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-gray-600 mb-4">
                      {selectedImage.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Added {formatDate(selectedImage.createdAt)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedImage.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedImage.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedImage?.title}"? This action cannot be undone.`}
        confirmText="Delete Image"
        type="danger"
      />
    </div>
  );
};

export default PackageImages;