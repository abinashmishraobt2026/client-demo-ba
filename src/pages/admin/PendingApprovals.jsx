import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  EyeIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { associatesAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const PendingApprovals = () => {
  const [pendingAssociates, setPendingAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchPendingAssociates();
  }, []);

  const fetchPendingAssociates = async () => {
    try {
      setLoading(true);
      const response = await associatesAPI.getAll();
      
      // Handle multiple possible response structures
      const associatesData = response.data?.associates || response.data?.data?.associates || response.data?.data || [];
      
      // Filter only inactive (pending approval) associates
      const pending = Array.isArray(associatesData) 
        ? associatesData.filter(associate => !associate.isActive)
        : [];
      
      setPendingAssociates(pending);
    } catch {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (associate) => {
    try {
      await associatesAPI.approve(associate.id);
      toast.success(`${associate.name} approved successfully! Welcome email sent.`);
      fetchPendingAssociates(); // Refresh the list
    } catch {
      toast.error('Failed to approve associate');
    }
  };

  const handleReject = async (associate) => {
    try {
      // For now, we'll just delete the associate
      // In future, you might want to add a rejection reason
      toast.error('Rejection functionality not implemented yet');
    } catch {
      toast.error('Failed to reject associate');
    }
  };

  const handleViewDetails = (associate) => {
    setSelectedAssociate(associate);
    setShowDetailsModal(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      handleApprove(selectedAssociate);
    } else if (actionType === 'reject') {
      handleReject(selectedAssociate);
    }
    setShowConfirmModal(false);
    setSelectedAssociate(null);
    setActionType('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-gray-600">Review and approve new associate registrations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-gray-400" />
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingAssociates.length} Pending
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAssociates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Approvals</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAssociates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Associates List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            New Associate Registrations
          </h2>
          <p className="text-sm text-gray-600">
            Review the details and approve or reject applications
          </p>
        </div>

        {pendingAssociates.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All associate registrations have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingAssociates.map((associate) => (
              <div key={associate.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {associate.name}
                          </h3>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            {associate.uniqueId}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-4 w-4" />
                            <span>{associate.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{associate.phone || 'Not provided'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Registered on {formatDate(associate.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleViewDetails(associate)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedAssociate(associate);
                        setActionType('approve');
                        setShowConfirmModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedAssociate(associate);
                        setActionType('reject');
                        setShowConfirmModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAssociate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Associate Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-3">
                  <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-md font-semibold text-gray-900">Personal Information</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Unique ID</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.uniqueId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {selectedAssociate.address && (
                <div>
                  <div className="flex items-center mb-3">
                    <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900">Address Information</h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selectedAssociate.address}</p>
                  </div>
                </div>
              )}

              {/* Bank Information */}
              <div>
                <div className="flex items-center mb-3">
                  <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-md font-semibold text-gray-900">Bank Information</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Account Number</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedAssociate.accountNumber ? 
                          `****${selectedAssociate.accountNumber.slice(-4)}` : 
                          'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedAssociate.ifscCode || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">UPI ID</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.upiId || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Registration Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Registration Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedAssociate.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Pending Approval
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setActionType('approve');
                  setShowConfirmModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Approve Associate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={
          actionType === 'approve' ? 'Approve Associate' : 'Reject Associate'
        }
        message={
          actionType === 'approve'
            ? `Are you sure you want to approve ${selectedAssociate?.name}? They will receive a welcome email with login credentials.`
            : `Are you sure you want to reject ${selectedAssociate?.name}'s application? This action cannot be undone.`
        }
        confirmText={actionType === 'approve' ? 'Approve' : 'Reject'}
        type={actionType === 'approve' ? 'success' : 'danger'}
      />
    </div>
  );
};

export default PendingApprovals;